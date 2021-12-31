import { PerspectiveCamera, Scene, WebGLRenderer, Vector3, Raycaster, Matrix4, Quaternion } from 'three';
import { PointCloudOctree, Potree } from '../src';
import { PointCloudOctreeGeometryNode } from '../src/point-cloud-octree-geometry-node';
import { gsToPath } from '../src/utils/utils';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class Viewer {
  /**
   * The element where we will insert our canvas.
   */
  private targetEl: HTMLElement | undefined;
  /**
   * The ThreeJS renderer used to render the scene.
   */
  private renderer = new WebGLRenderer();
  /**
   * Our scene which will contain the point cloud.
   */
  scene: Scene = new Scene();
  /**
   * The camera used to view the scene.
   */
  camera: PerspectiveCamera = new PerspectiveCamera(45, NaN, 0.1, 1000);
  /**
   * Controls which update the position of the camera.
   */
  cameraControls!: any;
  /**
   * Out potree instance which handles updating point clouds, keeps track of loaded nodes, etc.
   */
  private potree = new Potree();
  /**
   * Array of point clouds which are in the scene and need to be updated.
   */
  private pointClouds: PointCloudOctree[] = [];
  /**
   * The time (milliseconds) when `loop()` was last called.
   */
  private prevTime: number | undefined;
  /**
   * requestAnimationFrame handle we can use to cancel the viewer loop.
   */
  private reqAnimationFrameHandle: number | undefined;

  /**
   * Initializes the viewer into the specified element.
   *
   * @param targetEl
   *    The element into which we should add the canvas where we will render the scene.
   */
  initialize(targetEl: HTMLElement): void {
    if (this.targetEl || !targetEl) {
      return;
    }

    this.targetEl = targetEl;
    targetEl.appendChild(this.renderer.domElement);

    this.cameraControls = new OrbitControls(this.camera, this.targetEl);

    this.resize();
    window.addEventListener('resize', this.resize);
    window.addEventListener('dblclick', this.ondblclick, false);

    requestAnimationFrame(this.loop);
  }

  /**
   * Performs any cleanup necessary to destroy/remove the viewer from the page.
   */
  destroy(): void {
    if (this.targetEl) {
      this.targetEl.removeChild(this.renderer.domElement);
      this.targetEl = undefined;
    }

    window.removeEventListener('resize', this.resize);

    // TODO: clean point clouds or other objects added to the scene.

    if (this.reqAnimationFrameHandle !== undefined) {
      cancelAnimationFrame(this.reqAnimationFrameHandle);
    }
  }

  // /**
  //  * Loads a point cloud into the viewer and returns it.
  //  *
  //  * @param fileName
  //  *    The name of the point cloud which is to be loaded.
  //  * @param baseUrl
  //  *    The url where the point cloud is located and from where we should load the octree nodes.
  //  */
  // load(fileName: string, baseUrl: string): Promise<PointCloudOctree> {
  //   return this.potree.loadPointCloud(
  //     // The file name of the point cloud which is to be loaded.
  //     fileName,
  //     // Given the relative URL of a file, should return a full URL.
  //     // r0.bin => "gs://myfile/r0.bin"
  //     url => `${baseUrl}${url}`,
  //   );
  // }

  loadSingle(url: string): Promise<PointCloudOctree> {
    return this.potree.loadSingle(
      url
    );
  }

  /**
   * Loads a point cloud into the viewer and returns it.
   *
   * @param jsonFile
   *    The path to the pointcloud file to load.
   * @param locJSON
   *    The JSON object of loc.json which maps where to find each node's ybf.
   */
    loadResonaiPotree(
      jsonFile: string,
      locJSON: any,
      callbacks: ((node: PointCloudOctreeGeometryNode) => void)[]): Promise<PointCloudOctree> {
      return this.potree.loadResonaiPointCloud(
        // The file name of the point cloud which is to be loaded.
        jsonFile,
        // Given index of the node should return the full path to the node's ybf.
        // 5 => "gs://snapshot3/010.ybf"
        (name, index) => {
          // TODO Shai - handle null (locJSON.node_locations[index] = 0)
          if (locJSON.paths_map[locJSON.node_locations[index]] === 'null') {
            return ''
          }
          return gsToPath(`${locJSON.paths_map[locJSON.node_locations[index]]}/${name}.ybf`)
          // return gsToPath(`${locJSON.paths_map[1]}/${name}.ybf`)
        },
        undefined,
        callbacks
      );
    }

  add(pco: PointCloudOctree): void {
    this.scene.add(pco);
    this.pointClouds.push(pco);
  }

  unload(): void {
    this.pointClouds.forEach(pco => {
      this.scene.remove(pco);
      pco.dispose();
    });

    this.pointClouds = [];
  }

  /**
   * Updates the point clouds, cameras or any other objects which are in the scene.
   *
   * @param dt
   *    The time, in milliseconds, since the last update.
   */
  update(_: number): void {
    // Alternatively, you could use Three's OrbitControls or any other
    // camera control system.
    this.cameraControls.update();

    // This is where most of the potree magic happens. It updates the
    // visibility of the octree nodes based on the camera frustum and it
    // triggers any loads/unloads which are necessary to keep the number
    // of visible points in check.
    // console.time('updatePointClouds');
    this.potree.updatePointClouds(this.pointClouds, this.camera, this.renderer);
    // console.timeEnd('updatePointClouds');
  }

  /**
   * Renders the scene into the canvas.
   */
  render(): void {
    // this.scene.rotation.y += 0.001
    // console.timeEnd('previous-render')

    // console.time('previous-render')
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * The main loop of the viewer, called at 60FPS, if possible.
   */
  loop = (time: number): void => {
    this.reqAnimationFrameHandle = requestAnimationFrame(this.loop);

    const prevTime = this.prevTime;
    this.prevTime = time;
    if (prevTime === undefined) {
      return;
    }

    this.update(time - prevTime);
    this.render();
  };

  ondblclick = (event: MouseEvent) => {
    const rect = (event.target as HTMLCanvasElement).getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width * 2 - 1;
    const y = (event.clientY - rect.top) / rect.height * -2 + 1;
    const dir = new Vector3(x, y, -1);
    dir.unproject(this.camera);

    const ray = new Raycaster(this.camera.position, dir.sub(this.camera.position).normalize());
    const pick = Potree.pick(
      this.pointClouds,
      this.renderer,
      this.camera,
      ray.ray)
    console.log(pick?.position?.toArray());
    if (pick?.position) {
      const dir = this.camera.position.clone().sub(this.cameraControls.target.clone());
      const pos = pick.position.clone().add(dir);
      const m = new Matrix4();
      m.lookAt(pos, pick.position, this.camera.up);
      const quat = new Quaternion().setFromRotationMatrix(m);
      this.camera.quaternion.copy(quat);
      this.camera.position.copy(pos);
      this.cameraControls.target.copy(pick.position);
      this.camera.updateMatrix();
    }
  }

  /**
   * Triggered anytime the window gets resized.
   */
  resize = () => {
    if (!this.targetEl) {
      return;
    }

    const { width, height } = this.targetEl.getBoundingClientRect();
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };
}
