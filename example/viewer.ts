import { MathUtils, PerspectiveCamera, Scene, Vector2, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { PointCloudOctree, Potree, PotreeVersion } from '../src';

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
  private potree_v1 = new Potree('v1');
  private potree_v2 = new Potree('v2');
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

  /**
   * Loads a point cloud into the viewer and returns it.
   *
   * @param fileName
   *    The name of the point cloud which is to be loaded.
   * @param baseUrl
   *    The url where the point cloud is located and from where we should load the octree nodes.
   */
  load(fileName: string, baseUrl: string, version: PotreeVersion = "v1"): Promise<PointCloudOctree> {
    const loader = version === 'v1' ? this.potree_v1 : this.potree_v2;
    return loader.loadPointCloud(
      // The file name of the point cloud which is to be loaded.
      fileName,
      // Given the relative URL of a file, should return a full URL.
      url => `${baseUrl}${url}`,
    );
  }

  add(pco: PointCloudOctree): void {
    this.scene.add(pco);
    this.pointClouds.push(pco);
  }

  disposePointCloud(pointCloud: PointCloudOctree): void {
    this.scene.remove(pointCloud);
    pointCloud.dispose();
    this.pointClouds = this.pointClouds.filter(pco => pco !== pointCloud);
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
    // visiblily of the octree nodes based on the camera frustum and it
    // triggers any loads/unloads which are necessary to keep the number
    // of visible points in check.
    this.potree_v1.updatePointClouds(this.pointClouds, this.camera, this.renderer);
    this.potree_v2.updatePointClouds(this.pointClouds, this.camera, this.renderer);
  }

  /**
   * Renders the scene into the canvas.
   */
  render(): void {
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

    const size = new Vector2();
    this.renderer.getSize(size);
    const dpr = this.renderer.getPixelRatio();
    let fov = this.camera.fov;
    let aspect = size.x / size.y;


    const focal = this.computeFocalLengths(size.x, size.y, fov, aspect, dpr);
    console.log(focal);
  };

  computeFocalLengths = (width: number, height: number, fov: number, aspect: number, dpr: number) => {

    // console.log(width, height, fov, aspect, dpr);

    const fovRad = MathUtils.degToRad(fov);
    const fovXRad = 2 * Math.atan(Math.tan(fovRad / 2) * aspect);
    const fy = (dpr * height) / (2 * Math.tan(fovRad / 2));
    const fx = (dpr * width) / (2 * Math.tan(fovXRad / 2));

    // console.log(fovRad, fovXRad, fy, fx);

    return new Vector2(fx, fy);
  };

}
