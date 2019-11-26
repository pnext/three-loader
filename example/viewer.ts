import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { PointCloudOctree, Potree } from '../src';

// tslint:disable-next-line:no-duplicate-imports
import * as THREE from 'three';
const OrbitControls = require('three-orbit-controls')(THREE);

export class Viewer {
  /**
   * Our scene which will contain the point cloud.
   */
  scene: Scene = new Scene();
  /**
   * The element where we will insert our canvas.
   */
  private targetEl: HTMLElement | undefined;
  /**
   * The ThreeJS renderer used to render the scene.
   */
  private renderer = new WebGLRenderer();
  /**
   * The camera used to view the scene.
   */
  camera: PerspectiveCamera = new PerspectiveCamera(45, NaN, 0.1, 1000);
  /**
   * Controls which update the position of the camera.
   */
  cameraControls!: any;

  /**
   * The element where we will insert our canvas.
   */
  private targetEl2: HTMLElement | undefined;
  /**
   * The ThreeJS renderer used to render the scene.
   */
  private renderer2 = new WebGLRenderer();
  /**
   * The camera used to view the scene.
   */
  camera2: PerspectiveCamera = new PerspectiveCamera(45, NaN, 0.1, 1000);
  /**
   * Controls which update the position of the camera.
   */
  cameraControls2!: any;
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
  initialize(targetEl: HTMLElement, targetEl2: HTMLElement): void {
    if ((this.targetEl || !targetEl) || (this.targetEl2 || !targetEl2)) {
      return;
    }

    this.targetEl = targetEl;
    targetEl.appendChild(this.renderer.domElement);
    
    this.targetEl2 = targetEl2;
    targetEl2.appendChild(this.renderer2.domElement);

    this.cameraControls = new OrbitControls(this.camera, this.targetEl);
    this.cameraControls2 = new OrbitControls(this.camera2, this.targetEl2);

    this.resize();
    window.addEventListener('resize', this.resize);

    requestAnimationFrame(this.loop);
  }

  /**
   * Performs any cleanup necessary to destroy/remove the viewer from the page.
   */
  destroy(): void {
    if (this.targetEl && this.targetEl2) {
      this.targetEl.removeChild(this.renderer.domElement);
      this.targetEl = undefined;

      this.targetEl2.removeChild(this.renderer2.domElement);
      this.targetEl2 = undefined;
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
  load(fileName: string, baseUrl: string): Promise<PointCloudOctree> {
    return this.potree.loadPointCloud(
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
    this.cameraControls2.update();

    // This is where most of the potree magic happens. It updates the
    // visiblily of the octree nodes based on the camera frustum and it
    // triggers any loads/unloads which are necessary to keep the number
    // of visible points in check.
    this.potree.updatePointClouds(this.pointClouds, [this.camera, this.camera2], [this.renderer, this.renderer2]);
  }

  /**
   * Renders the scene into the canvas.
   */
  render(): void {
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);

    this.renderer2.clear();
    this.renderer2.render(this.scene, this.camera2);
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
    if (!this.targetEl || !this.targetEl2) {
      return;
    }

    const {width, height} = this.targetEl.getBoundingClientRect();

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);

    this.camera2.aspect = width / height;
    this.camera2.updateProjectionMatrix();
    this.renderer2.setSize(width, height);
  };
}
