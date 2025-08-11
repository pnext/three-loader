import {
  Mesh,
  Vector2,
  RawShaderMaterial,
  InstancedBufferGeometry,
  BufferGeometry,
  BufferAttribute,
  Matrix4,
  Vector3,
  Camera,
  Quaternion,
  ShaderMaterial,
  DoubleSide,
  GLSL3,
  Object3D,
  Vector4,
} from 'three';

import { createSortWorker } from './workers/SortWorker';
import { PointCloudMaterial } from './materials';
import { GeometryData } from './geometryData';

const DELAYED_FRAMES = 2;
export class SplatsMesh extends Object3D {
  public mesh: any;
  public material: ShaderMaterial | null = null;
  private forceSorting: boolean = true;
  public continuousSorting: boolean = true;
  public totalSplats: number = 500000;

  private nodesAsString: string = '';

  private geometryData: any;
  private buffers: any;
  private textures: any;

  private sorter: any;
  private lastSortViewDir = new Vector3(0, 0, -1);
  private sortViewDir = new Vector3(0, 0, -1);
  private lastSortViewPos = new Vector3();
  private sortViewOffset = new Vector3();

  private enableSorting = true;

  private enabled: boolean = false;

  private instanceCount: number = 0;
  private debugMode = false;

  rendererSize = new Vector2();

  private harmonicsEnabled: boolean = false;

  constructor(debug: boolean = false) {
    super();
    this.debugMode = debug;
  }

  initialize(maxPointBudget: number, renderHamonics = false) {
    this.harmonicsEnabled = renderHamonics;

    this.geometryData = new GeometryData(maxPointBudget, renderHamonics);

    return createSortWorker(maxPointBudget).then((result) => {
      this.sorter = result;

      const quadVertices = new Float32Array([-1, -1, 0.0, 1, -1, 0.0, -1, 1, 0.0, 1, 1, 0.0]);
      const quadIndices = new Uint16Array([0, 1, 2, 2, 1, 3]);

      //Global mesh used to setup the global rendering of the points
      let shader = new ShaderMaterial({
        glslVersion: GLSL3,
        vertexShader: require('./materials/shaders/splats.vert').default,
        fragmentShader: require('./materials/shaders/splats.frag').default,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        side: DoubleSide,
        uniforms: {
          focal: { value: new Vector2(0, 0) },
          inverseFocalAdjustment: { value: 1 },
          splatScale: { value: 1 },
          basisViewport: { value: new Vector2(0, 0) },
          sortedTexture: { value: null },
          covarianceTexture0: { value: null },
          covarianceTexture1: { value: null },
          posColorTexture: { value: null },
          nodeTexture: { value: null },
          nodeTexture2: { value: null },
          nodeIndicesTexture: { value: null },
          indicesTexture: { value: null },
          harmonicsTexture1: { value: null },
          harmonicsTexture2: { value: null },
          harmonicsTexture3: { value: null },
          visibleNodes: { value: null },
          cameraPosition: { value: new Vector3(0, 0, 0) },
          harmonicsDegree: { value: renderHamonics ? 3 : 0 },
          renderIds: { value: false },
          debugMode: { value: false },
          renderOnlyHarmonics: { value: false },
          renderLoD: { value: false },
          adaptiveSize: { value: true },
          harmonicsScale: { value: 4 },
          octreeSize: { value: 0 },
          fov: { value: 1 },
          maxSplatScale: { value: 3 },
          screenHeight: { value: 1 },
          spacing: { value: 1 },
          useClipping: { value: false },
          screenWidth: { value: 0 },
          clipExtent: { value: new Vector4(0, 0, 1, 1) },
          maxDepth: { value: 1 },
        },
      });

      this.material = shader;
      this.instanceCount = 0;

      //Create the global textures
      this.buffers = this.geometryData.buffers;
      this.textures = this.geometryData.textures;

      if (this.material) {
        this.material.uniforms['sortedTexture'].value = this.textures.get('sorted');
        this.material.uniforms['posColorTexture'].value = this.textures.get('posColor');
        this.material.uniforms['covarianceTexture0'].value = this.textures.get('covariance0');
        this.material.uniforms['covarianceTexture1'].value = this.textures.get('covariance1');
        this.material.uniforms['nodeTexture'].value = this.textures.get('node');
        this.material.uniforms['nodeTexture2'].value = this.textures.get('node2');
        this.material.uniforms['nodeIndicesTexture'].value = this.textures.get('nodeIndices');
        this.material.uniforms['harmonicsTexture1'].value = this.textures.get('harmonics1');
        this.material.uniforms['harmonicsTexture2'].value = this.textures.get('harmonics2');
        this.material.uniforms['harmonicsTexture3'].value = this.textures.get('harmonics3');
        this.material.uniforms.visibleNodes.value = this.textures.get('visibility');
      }

      let geom = new InstancedBufferGeometry();

      geom.setAttribute('position', new BufferAttribute(quadVertices, 3));
      geom.setIndex(new BufferAttribute(quadIndices, 1));

      this.mesh = new Mesh(geom, shader);
      this.mesh.frustumCulled = false;
      this.add(this.mesh);

      this.enabled = true;
    });
  }

  renderSplatsIDs(status: boolean) {
    if (this.material == null) return;

    this.material.uniforms['renderIds'].value = status;
    this.material.transparent = !status;
  }

  update(mesh: Mesh, camera: Camera, size: Vector2, callback = () => {}) {
    if (this.material == null) return;

    this.material.uniforms['cameraPosition'].value = camera.position;

    let mat = mesh.material as RawShaderMaterial;
    mat.visible = false;

    //Passing the uniforms from the point cloud material to the splats material.
    this.material.uniforms.octreeSize.value = mat.uniforms.octreeSize.value;
    this.material.uniforms.fov.value = mat.uniforms.fov.value;
    this.material.uniforms.spacing.value = mat.uniforms.spacing.value;
    this.material.uniforms.screenHeight.value = mat.uniforms.screenHeight.value;
    this.material.uniforms.screenWidth.value = mat.uniforms.screenWidth.value;

    let material = this.material as RawShaderMaterial;

    material.uniforms.basisViewport.value.set(1.0 / size.x, 1.0 / size.y);

    const focalLengthX = camera.projectionMatrix.elements[0] * 0.5 * size.x;

    const focalLengthY = camera.projectionMatrix.elements[5] * 0.5 * size.y;

    material.uniforms.focal.value.set(focalLengthX, focalLengthY);

    let instanceCount = 0;
    let nodesCount = 0;
    let nodesAsString = '';

    let totalMemoryUsed = 0;
    let totalMemoryInDisplay = 0;

    mesh.traverse((el) => {
      let m = el as Mesh;
      let g = m.geometry as BufferGeometry;
      instanceCount += g.drawRange.count;
    });

    totalMemoryUsed = instanceCount * (this.harmonicsEnabled ? 236 : 56);

    mesh.traverseVisible((el) => {
      nodesAsString += el.name;
    });

    this.forceSorting = false;

    if (nodesAsString !== this.nodesAsString && this.enableSorting) {
      this.nodesAsString = nodesAsString;

      instanceCount = 0;
      nodesCount = 0;

      //Copy the data from the visibility nodes, it uses a separated texture to sync when
      //it is updated in relationship with the other textures.
      this.buffers.get('visibility').set(mat.uniforms.visibleNodes.value.image.data);

      mesh.traverseVisible((el) => {
        let m = el as Mesh;
        let g = m.geometry as BufferGeometry;

        if (this.material) {
          this.material.uniforms.maxDepth.value = g.userData.maxDepth;
          this.material.uniforms.maxSplatScale.value = g.userData.maxDepth;
          this.totalSplats = g.userData.totalSplats;
        }

        let pointCloudMaterial = mesh.material as PointCloudMaterial;
        const vnStart = pointCloudMaterial.visibleNodeTextureOffsets.get(el.name)!;
        const level = m.name.length - 1;

        let nodeInfo = [m.position.x, m.position.y, m.position.z, 1];
        let nodeInfo2 = [vnStart, level];
        this.buffers.get('node').set(nodeInfo, nodesCount * 4);
        this.buffers.get('node2').set(nodeInfo2, nodesCount * 2);

        this.buffers
          .get('nodeIndices')
          .set(new Uint32Array(g.drawRange.count).fill(nodesCount), instanceCount);

        //Used for sorting
        this.buffers.get('centers').set(g.getAttribute('raw_position').array, instanceCount * 4);

        //Used for raycasting
        this.buffers.get('positions').set(g.getAttribute('centers').array, instanceCount * 4);
        this.buffers.get('scale').set(g.getAttribute('scale').array, instanceCount * 3);
        this.buffers.get('orientation').set(g.getAttribute('orientation').array, instanceCount * 4);

        //Used for rendering
        this.buffers.get('covariance0').set(g.getAttribute('COVARIANCE0').array, instanceCount * 4);
        this.buffers.get('covariance1').set(g.getAttribute('COVARIANCE1').array, instanceCount * 2);
        this.buffers.get('posColor').set(g.getAttribute('POS_COLOR').array, instanceCount * 4);

        if (this.harmonicsEnabled) {
          this.buffers.get('harmonics1').set(g.getAttribute('HARMONICS1').array, instanceCount * 3);
          this.buffers.get('harmonics2').set(g.getAttribute('HARMONICS2').array, instanceCount * 5);
          this.buffers.get('harmonics3').set(g.getAttribute('HARMONICS3').array, instanceCount * 7);
        }

        instanceCount += g.drawRange.count;
        nodesCount++;
      });

      totalMemoryInDisplay = instanceCount * (this.harmonicsEnabled ? 236 : 56);

      if (this.debugMode) {
        console.log('total memory in usage: ' + Math.ceil(totalMemoryUsed / 1000000) + ' MB');
        console.log('total memory displayed: ' + Math.ceil(totalMemoryInDisplay / 1000000) + ' MB');
        console.log('levels displayed: ' + nodesAsString);
      }

      this.instanceCount = instanceCount;

      this.forceSorting = true;

      this.sortSplats(camera, callback);
      return false;
    } else {
      return true;
    }
  }

  defer() {
    let promise = new Promise((resolve) => {
      let counter = 0;

      let frameCounter = () => {
        let anim = requestAnimationFrame(frameCounter);
        if (counter == DELAYED_FRAMES) {
          resolve('true');
          cancelAnimationFrame(anim);
        }
        counter++;
      };

      frameCounter();
    });

    return promise;
  }

  sortSplats(camera: Camera, callback = () => {}) {
    if (this.mesh == null || this.instanceCount == 0) return;

    let mvpMatrix = new Matrix4();
    camera.updateMatrixWorld();
    mvpMatrix.copy(camera.matrixWorld).invert();
    mvpMatrix.premultiply(camera.projectionMatrix);
    mvpMatrix.multiply(this.mesh.matrixWorld);

    let angleDiff = 0;
    let positionDiff = 0;

    this.sortViewDir.set(0, 0, -1).applyQuaternion(camera.quaternion);
    angleDiff = this.sortViewDir.dot(this.lastSortViewDir);
    positionDiff = this.sortViewOffset.copy(camera.position).sub(this.lastSortViewPos).length();

    if (
      (this.continuousSorting || this.forceSorting || angleDiff <= 0.99 || positionDiff >= 1.0) &&
      this.enableSorting
    ) {
      let sortMessage = {
        indices: this.geometryData.indexesBuffer,
        centers: this.buffers.get('centers'),
        modelViewProj: mvpMatrix.elements,
        totalSplats: this.instanceCount,
      };

      this.sorter.postMessage({
        sort: sortMessage,
      });

      this.enableSorting = false;
      this.forceSorting = false;

      this.sorter.onmessage = async (e: any) => {
        if (e.data.dataSorted) {
          if (e.data.dataSorted != null) {
            this.buffers.get('sorted').set(new Uint32Array(e.data.dataSorted), 0);
            this.textures.forEach((text: any) => (text.needsUpdate = true));

            this.mesh.geometry.instanceCount = this.instanceCount;

            this.defer().then((_) => {
              callback();
              this.enableSorting = true;
            });
          } else {
            this.enableSorting = true;
          }
        }
      };

      this.lastSortViewPos.copy(camera.position);
      this.lastSortViewDir.copy(this.sortViewDir);
    }
  }

  getSplatData(globalID: any, nodeID: any) {
    if (this.mesh == null) return null;

    let center = new Vector3();
    let offset = new Vector3();

    let scale = new Vector3();
    let orientation = new Quaternion();

    center.x = this.buffers.get('positions')[4 * globalID + 0];
    center.y = this.buffers.get('positions')[4 * globalID + 1];
    center.z = this.buffers.get('positions')[4 * globalID + 2];

    scale.x = this.buffers.get('scale')[3 * globalID + 0];
    scale.y = this.buffers.get('scale')[3 * globalID + 1];
    scale.z = this.buffers.get('scale')[3 * globalID + 2];

    orientation.w = this.buffers.get('orientation')[4 * globalID + 0];
    orientation.x = this.buffers.get('orientation')[4 * globalID + 1];
    orientation.y = this.buffers.get('orientation')[4 * globalID + 2];
    orientation.z = this.buffers.get('orientation')[4 * globalID + 3];

    offset.x = this.buffers.get('node')[4 * nodeID + 0];
    offset.y = this.buffers.get('node')[4 * nodeID + 1];
    offset.z = this.buffers.get('node')[4 * nodeID + 2];

    center.add(offset);

    let result = this.mesh.localToWorld(center);

    return {
      position: result,
      scale,
      orientation,
    };
  }

  dispose() {
    if (!this.enabled) return;

    //Terminate the sorter
    this.sorter.terminate();
    this.sorter = null;

    //Removing attributes
    this.mesh.geometry.dispose();

    //Remove the shader
    this.material?.dispose();

    //Remove textures and buffers
    this.geometryData.dispose();

    //kill the mesh
    this.mesh = null;

    this.enabled = false;
  }

  get splatsEnabled(): boolean {
    return this.enabled;
  }
}
