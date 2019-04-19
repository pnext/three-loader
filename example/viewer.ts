import { PerspectiveCamera, Scene, WebGLRenderer, Vector3, Matrix4 } from 'three';
import { PointCloudOctree, Potree, ClipMode, IClipBox, ClipBox, IClipSphere, ClipSphere, IClipPlane, ClipPlane } from '../src';

// tslint:disable-next-line:no-duplicate-imports
import * as THREE from 'three';
const OrbitControls = require('three-orbit-controls')(THREE);

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
   * Array of clipBoxes which are in the scene and need to be updated.
   */
  private clipBoxes: ClipBox[] = [];
  /**
   * Array of clipSpheres which are in the scene and need to be updated.
   */
  private clipSpheres: ClipSphere[] = [];
  /**
   * Array of clipSpheres which are in the scene and need to be updated.
   */
  private clipPlanes: ClipPlane[] = [];
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

    // ELLIOTT EXPERIMENT WITH RENDERER CLIPPING PLANES
    this.renderer.localClippingEnabled = true;

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

  addClipBox(clipBox: IClipBox): void {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshLambertMaterial({
      color: '#00ff00',
      opacity: 0.25,
      transparent: true, 
      wireframe: true,
    });
    const cube = new THREE.Mesh( geometry, material );
    this.clipBoxes.push({
      iClipBox: clipBox,
      geometry: geometry,
      color: '#00FF00',
      mesh: cube,
      position: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Quaternion,
      scale: new THREE.Vector3(1, 1, 1),
    });
    this.scene.add(this.clipBoxes[0].mesh);
  }

  addClipSphere(clipSphere: IClipSphere): void {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshLambertMaterial({ 
      color: '#0000ff',
      opacity: 0.25,
      transparent: true, 
      wireframe: true,
    });
    const sphere = new THREE.Mesh( geometry, material);
    this.clipSpheres.push({
      iClipSphere: clipSphere,
      geometry: geometry,
      color: '#0000FF',
      mesh: sphere,
      position: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Quaternion,
      scale: new THREE.Vector3(1, 1, 1),
    });
    this.scene.add(this.clipSpheres[0].mesh);
  }

  addClipPlane(clipPlane: IClipPlane): void {
    const geometry = new THREE.PlaneGeometry( 5, 20, 32 );
    const material = new THREE.MeshBasicMaterial({
      color: '#ff00ff',
      side: THREE.DoubleSide,
      opacity: 0.25,
      transparent: true, 
    });
    const plane = new THREE.Mesh( geometry, material );
    this.clipPlanes.push({
      iClipPlane: clipPlane,
      geometry: geometry,
      color: '#0000FF',
      mesh: plane,
      position: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Quaternion(),
      scale: new THREE.Vector3(1, 1, 1),
    });
    this.scene.add(plane);
  }

  updateClipMode() {
    const pcos = this.pointClouds;
    const numPcos = pcos.length;
    if (numPcos > 0) {
      const pointCloud = pcos[0];
      if (pointCloud.material.clipMode === ClipMode.HIGHLIGHT_INSIDE) {
        pointCloud.material.clipMode = ClipMode.CLIP_OUTSIDE;
      } else if (pointCloud.material.clipMode === ClipMode.CLIP_OUTSIDE) {
        pointCloud.material.clipMode = ClipMode.CLIP_INSIDE;
      } else if (pointCloud.material.clipMode === ClipMode.CLIP_INSIDE) {
        pointCloud.material.clipMode = ClipMode.HIGHLIGHT_INSIDE;
      }
    }
  }

  translateClipBox = (translation: Vector3, axis: string) => {
    const currentPos = this.clipBoxes[0].position;
    if (axis === 'x') {
      this.clipBoxes[0].position = new Vector3(translation.x, currentPos.y, currentPos.z);
    } else if (axis === 'y') {
      this.clipBoxes[0].position = new Vector3(currentPos.x, translation.y, currentPos.z);
    } else if (axis === 'z') {
      this.clipBoxes[0].position = new Vector3(currentPos.x, currentPos.y, translation.z);
    }
    
    this.clipBoxes[0].mesh.position.set(this.clipBoxes[0].position.x, this.clipBoxes[0].position.y, this.clipBoxes[0].position.z);

    let iClipBox = this.clipBoxes[0].iClipBox;
    const m = new Matrix4;
    m.compose(
      this.clipBoxes[0].position,
      this.clipBoxes[0].rotation,
      this.clipBoxes[0].scale,
    );
    iClipBox.matrix.getInverse(m);
    this.pointClouds[0].material.setClipBoxes([iClipBox]);
  }

  scaleClipBox = (scale: number) => {
    this.clipBoxes[0].scale = new Vector3(scale, scale, scale);
    this.clipBoxes[0].mesh.scale.set(this.clipBoxes[0].scale.x, this.clipBoxes[0].scale.y, this.clipBoxes[0].scale.z);
    let iClipBox = this.clipBoxes[0].iClipBox;
    const m = new Matrix4;
    m.compose(
      this.clipBoxes[0].position,
      this.clipBoxes[0].rotation,
      this.clipBoxes[0].scale,
    )
    iClipBox.matrix.getInverse(m);
    this.pointClouds[0].material.setClipBoxes([iClipBox]);
  }

  translateClipSphere = (translation: Vector3, axis: string) => {
    const currentPos = this.clipSpheres[0].position;
    if (axis === 'x') {
      this.clipSpheres[0].position = new Vector3(translation.x, currentPos.y, currentPos.z);
    } else if (axis === 'y') {
      this.clipSpheres[0].position = new Vector3(currentPos.x, translation.y, currentPos.z);
    } else if (axis === 'z') {
      this.clipSpheres[0].position = new Vector3(currentPos.x, currentPos.y, translation.z);
    }
    
    this.clipSpheres[0].mesh.position.set(this.clipSpheres[0].position.x, this.clipSpheres[0].position.y, this.clipSpheres[0].position.z);
    let iClipSphere = this.clipSpheres[0].iClipSphere;
    const m = new Matrix4;
    m.compose(
      this.clipSpheres[0].position,
      this.clipSpheres[0].rotation,
      this.clipSpheres[0].scale,
    );
    iClipSphere.matrix.getInverse(m); 
    this.pointClouds[0].material.setClipSpheres([iClipSphere]);
  }

  scaleClipSphere = (scale: number) => {
    this.clipSpheres[0].scale = new Vector3(scale, scale, scale);
    this.clipSpheres[0].mesh.scale.set(this.clipSpheres[0].scale.x, this.clipSpheres[0].scale.y, this.clipSpheres[0].scale.z);
    let iClipSphere = this.clipSpheres[0].iClipSphere;
    const m = new Matrix4;
    m.compose(
      this.clipSpheres[0].position,
      this.clipSpheres[0].rotation,
      this.clipSpheres[0].scale,
    )
    iClipSphere.matrix.getInverse(m);
    this.pointClouds[0].material.setClipSpheres([iClipSphere]);
  }

  translateClipPlane = (translation: Vector3, axis: string) => {
    const currentPos = this.clipPlanes[0].position;
    if (axis === 'x') {
      this.clipPlanes[0].position = new Vector3(translation.x, currentPos.y, currentPos.z);
    } else if (axis === 'y') {
      this.clipPlanes[0].position = new Vector3(currentPos.x, translation.y, currentPos.z);
    } else if (axis === 'PZ') {
      this.clipPlanes[0].position = new Vector3(currentPos.x, currentPos.y, translation.z);
    }
    
    this.clipPlanes[0].mesh.position.set(this.clipPlanes[0].position.x, this.clipPlanes[0].position.y, this.clipPlanes[0].position.z);

    let iClipPlane = this.clipPlanes[0].iClipPlane;
    const m = new Matrix4();
    m.compose(
      this.clipPlanes[0].position,
      this.clipPlanes[0].rotation,
      this.clipPlanes[0].scale,
    );
    iClipPlane.matrix.getInverse(m);
    console.log(iClipPlane.matrix);

    let iClipPlane2 = this.clipPlanes[1].iClipPlane;
    const m2 = new Matrix4();
    m2.compose(
      this.clipPlanes[0].position,
      this.clipPlanes[0].rotation,
      this.clipPlanes[0].scale,
    );
    iClipPlane2.matrix.getInverse(m2);

    this.pointClouds[0].material.setClipPlanes([iClipPlane, iClipPlane]);
  }

  rotateClipPlane = (rotationAngle: number) => {
    this.clipPlanes[0].rotation.setFromAxisAngle(new Vector3(1, 0, 0), rotationAngle);
    let newEuler = new THREE.Euler();
    newEuler.setFromQuaternion(this.clipPlanes[0].rotation);
    this.clipPlanes[0].mesh.rotation.set(newEuler.x, newEuler.y, newEuler.z);
    let iClipPlane = this.clipPlanes[0].iClipPlane;
    const m = new Matrix4;
    m.compose(
      this.clipPlanes[0].position,
      this.clipPlanes[0].rotation,
      this.clipPlanes[0].scale,
    );
    iClipPlane.matrix.getInverse(m);

    let iClipPlane2 = this.clipPlanes[1].iClipPlane;
    const m2 = new Matrix4;
    m2.compose(
      this.clipPlanes[1].position,
      this.clipPlanes[1].rotation,
      this.clipPlanes[1].scale,
    );
    iClipPlane2.matrix.getInverse(m2);

    this.pointClouds[0].material.setClipPlanes([iClipPlane, iClipPlane2]);
  }

  addAxes() {
    this.addAxis(new THREE.Vector3(-10, 0, 0), new THREE.Vector3(10, 0, 0), '#FF0000');
    this.addAxis(new THREE.Vector3(0, -10, 0), new THREE.Vector3(0, 10, 0), '#00FF00');
    this.addAxis(new THREE.Vector3(0, 0, -10), new THREE.Vector3(0, 0, 10), '#0000FF');
  }

  addAxis(start: Vector3, end: Vector3, axisColor: string) {
    const axisMaterial = new THREE.LineBasicMaterial({ color: axisColor});
    const axisGeometry = new THREE.Geometry();
    axisGeometry.vertices.push(start);
    axisGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
    axisGeometry.vertices.push(end);
    const axis = new THREE.Line( axisGeometry, axisMaterial);
    this.scene.add(axis);
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
    // visiblily of the octree nodes based on the camera frustum and it
    // triggers any loads/unloads which are necessary to keep the number
    // of visible points in check.
    this.potree.updatePointClouds(this.pointClouds, this.camera, this.renderer);
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
  };
}
