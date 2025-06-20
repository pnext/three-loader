import {
  Mesh,
  PerspectiveCamera,
  Scene,
  Vector2,
  WebGLRenderer,
  Raycaster,
  WebGLRenderTarget,
  NearestFilter,
  SphereGeometry,
  MeshBasicMaterial,
  FloatType,
  RGFormat,
  Vector3,
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { PointCloudOctree, Potree, PotreeVersion } from '../src';

export class Viewer {
  public enableUpdate: boolean = true;

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
  globalScene: Scene = new Scene();

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
  pointClouds: PointCloudOctree[] = [];
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

  private IDRenderTarget: any;
  private raycastSplat: any;
  private raycastSplatDebug: any;

  private elapsedTime: number = 0;
  private raycaster = new Raycaster();

  //Max amount of points available to render harmonics inside a 4096 x 4096 texture
  //anything above 2.300.000 particles will require a higher texture and could break.
  private pointBudget = 1200000;

  async initialize(targetEl: HTMLElement): Promise<void> {
    if (this.targetEl || !targetEl) {
      return;
    }

    this.potree_v2.pointBudget = this.pointBudget;

    //setup the splats manager
    this.globalScene = new Scene();

    this.IDRenderTarget = new WebGLRenderTarget(1, 1, {
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      format: RGFormat,
      type: FloatType,
    });

    const mat = new MeshBasicMaterial({ color: '#ffffff' });
    mat.transparent = true;
    mat.wireframe = true;
    const planeGeo = new SphereGeometry(1);
    this.raycastSplat = new Mesh(planeGeo, mat);
    this.raycastSplat.renderOrder = 100;

    const mat2 = new MeshBasicMaterial({ color: '#ff0000' });
    mat.transparent = true;
    const sphereGeo = new SphereGeometry(0.005);
    this.raycastSplatDebug = new Mesh(sphereGeo, mat2);
    this.raycastSplatDebug.renderOrder = 10000;

    this.targetEl = targetEl;
    targetEl.appendChild(this.renderer.domElement);

    this.cameraControls = new OrbitControls(this.camera, this.targetEl);
    this.cameraControls.target.set(9, 3, -6.5);

    this.resize();
    window.addEventListener('resize', this.resize);

    targetEl.addEventListener('mousedown', (_) => {
      this.elapsedTime = Date.now();
    });

    targetEl.addEventListener('mouseup', this.updateCameraTarget.bind(this));

    requestAnimationFrame(this.loop);
  }

  updateCameraTarget(e: any) {
    if (!this.pointClouds[0]?.splatsMesh?.splatsEnabled) return;

    let clickTime = Date.now();
    let deltaTime = clickTime - this.elapsedTime;

    if (deltaTime < 200) {
      const rgba = new Float32Array(4);
      const DPR = this.renderer?.getPixelRatio() || 1;
      this.renderer?.readRenderTargetPixels(
        this.IDRenderTarget,
        e.clientX * DPR,
        DPR * (window.innerHeight - e.clientY),
        1,
        1,
        rgba,
      );
      const globalID = rgba[0];
      const nodeID = rgba[1];

      const splatData = this.pointClouds[0].splatsMesh.getSplatData(globalID, nodeID);

      if (splatData != null) {
        let scale = splatData.scale;
        if (scale.x === 0) scale.x = 0.0001;
        if (scale.y === 0) scale.y = 0.0001;
        if (scale.z === 0) scale.z = 0.0001;
        scale.multiplyScalar(2.82842712475);

        this.raycastSplat.position.copy(splatData.position);
        this.raycastSplat.scale.copy(scale);
        this.raycastSplat.quaternion.copy(splatData.orientation);

        this.raycastSplat.updateMatrix();
        this.raycastSplat.updateMatrixWorld();

        let mousePosition = new Vector2(
          e.clientX / window.innerWidth,
          e.clientY / window.innerHeight,
        );
        mousePosition.x = 2 * mousePosition.x - 1;
        mousePosition.y = -2 * mousePosition.y + 1;
        this.raycaster.setFromCamera(mousePosition, this.camera);

        const intersects = this.raycaster.intersectObject(this.raycastSplat);

        let center = new Vector3(Infinity, Infinity, Infinity);
        if (intersects.length > 0) {
          center = intersects[0].point;
          this.raycastSplatDebug.position.copy(center);
          this.cameraControls.target.copy(center);
        } else {
          this.cameraControls.target.copy(splatData.position);
        }

        deltaTime = clickTime;
      }
    }
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
  async load(
    fileName: string,
    baseUrl: string,
    version: PotreeVersion = 'v1',
    loadHarmonics: boolean = false,
  ): Promise<PointCloudOctree> {
    const loader = version === 'v1' ? this.potree_v1 : this.potree_v2;

    return loader.loadPointCloud(
      // The file name of the point cloud which is to be loaded.
      fileName,
      // Given the relative URL of a file, should return a full URL.
      (url) => `${baseUrl}${url}`,
      undefined,
      //Load the harmonics if necessary (for desktop only)
      loadHarmonics,
    );
  }

  add(pco: PointCloudOctree): void {
    this.scene.add(pco);
    this.pointClouds.push(pco);
  }

  disposePointCloud(pointCloud: PointCloudOctree): void {
    this.scene.remove(pointCloud);
    pointCloud.dispose();
    this.pointClouds = this.pointClouds.filter((pco) => pco !== pointCloud);
  }

  async renderAsSplats(): Promise<Viewer> {
    return this;
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

    //This is used to setup the different nodes of the Octree from Potree
    this.renderer.render(this.scene, this.camera);

    if (this.pointClouds[0]?.splatsMesh?.splatsEnabled) {
      const h = this.renderer.domElement.height || 1;
      const w = this.renderer.domElement.width || 1;
      this.IDRenderTarget.setSize(w, h);

      //Setup the splats to render in ID mode
      this.pointClouds[0].splatsMesh.renderSplatsIDs(true);
      this.renderer.setRenderTarget(this.IDRenderTarget);
      this.renderer.clear();
      this.globalScene.add(this.pointClouds[0]);
      this.renderer.render(this.globalScene, this.camera);

      this.scene.add(this.pointClouds[0]);
      this.pointClouds[0].splatsMesh.renderSplatsIDs(false);
      this.renderer.setRenderTarget(null);
    }
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
  };
}
