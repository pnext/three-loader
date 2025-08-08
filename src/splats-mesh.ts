import {
  Mesh,
  Vector2,
  RawShaderMaterial,
  InstancedBufferGeometry,
  BufferGeometry,
  InstancedBufferAttribute,
  RGBAIntegerFormat,
  UnsignedIntType,
  DataTexture,
  RGBAFormat,
  FloatType,
  RGFormat,
  BufferAttribute,
  Matrix4,
  Vector3,
  RedIntegerFormat,
  Camera,
  Quaternion,
  Texture,
  ShaderMaterial,
  DoubleSide,
  GLSL3,
  Object3D,
  NearestFilter,
  RGIntegerFormat,
  Vector4,
} from 'three';

import { createSortWorker } from './workers/SortWorker';
import { PointCloudMaterial } from './materials';

export class SplatsMesh extends Object3D {
  public mesh: any;
  public material: ShaderMaterial | null = null;
  public forceSorting: boolean = true;

  private nodesAsString: string = '';

  private texturePosColor_read: any;
  private textureCovariance0_read: any;
  private textureCovariance1_read: any;
  private textureNode_read: any;
  private textureNode2_read: any;
  private textureNodeIndices_read: any;
  private textureVisibilityNodes_read: any;
  private textureHarmonics1_read: any;
  private textureHarmonics2_read: any;
  private textureHarmonics3_read: any;

  private bufferOrientation_read: any;
  private bufferPosColor_read: any;
  private bufferCovariance0_read: any;
  private bufferCovariance1_read: any;
  private bufferNodes_read: any;
  private bufferNodes2_read: any;
  private bufferNodesIndices_read: any;
  private bufferVisibilityNodes: any;
  private bufferHarmonics1_read: any;
  private bufferHarmonics2_read: any;
  private bufferHarmonics3_read: any;

  private bufferCenters_read: any;
  private bufferPositions_read: any;
  private bufferScale_read: any;

  private sorter: any;
  private lastSortViewDir = new Vector3(0, 0, -1);
  private sortViewDir = new Vector3(0, 0, -1);
  private lastSortViewPos = new Vector3();

  private sortViewOffset = new Vector3();
  private enableSorting = true;

  private indexesBuffer: any;

  private textures: Array<Texture> = new Array();
  private enabled: boolean = false;
  private texturesNeedUpdate = false;

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

    return createSortWorker(maxPointBudget).then((result) => {
      this.sorter = result;
      this.indexesBuffer = new Int32Array(maxPointBudget);
      let indexesToSort = new Int32Array(maxPointBudget);

      for (let i = 0; i < maxPointBudget; i++) {
        this.indexesBuffer[i] = i;
        indexesToSort[i] = i;
      }

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

      let geom = new InstancedBufferGeometry();

      geom.setAttribute('position', new BufferAttribute(quadVertices, 3));
      geom.setIndex(new BufferAttribute(quadIndices, 1));
      geom.setAttribute('indexes_sorted', new InstancedBufferAttribute(indexesToSort, 1));

      this.mesh = new Mesh(geom, shader);
      this.mesh.frustumCulled = false;
      this.add(this.mesh);

      //Create the global textures
      let size = Math.ceil(Math.sqrt(maxPointBudget));

      //For the harmonics
      let degree1Size = renderHamonics ? Math.ceil(Math.sqrt(maxPointBudget * 3)) : 1;
      let degree2Size = renderHamonics ? Math.ceil(Math.sqrt(maxPointBudget * 5)) : 1;
      let degree3Size = renderHamonics ? Math.ceil(Math.sqrt(maxPointBudget * 7)) : 1;

      this.bufferCenters_read = new Float32Array(size * size * 4);
      this.bufferPositions_read = new Float32Array(size * size * 4);
      this.bufferScale_read = new Float32Array(size * size * 3);

      this.bufferOrientation_read = new Float32Array(size * size * 4);
      this.bufferPosColor_read = new Uint32Array(size * size * 4);
      this.bufferCovariance0_read = new Float32Array(size * size * 4);
      this.bufferCovariance1_read = new Float32Array(size * size * 2);
      this.bufferNodes_read = new Float32Array(100 * 100 * 4);
      this.bufferNodes2_read = new Uint32Array(100 * 100 * 2);
      this.bufferNodesIndices_read = new Uint32Array(size * size);
      this.bufferVisibilityNodes = new Uint8Array(2048 * 4);
      this.bufferHarmonics1_read = new Uint32Array(degree1Size * degree1Size);
      this.bufferHarmonics2_read = new Uint32Array(degree2Size * degree2Size);
      this.bufferHarmonics3_read = new Uint32Array(degree3Size * degree3Size);

      if (this.debugMode)
        console.log('max texture size: ' + degree3Size + ' point budget: ' + maxPointBudget);

      //This should be able to save up to 10000 nodes
      this.textureNode_read = new DataTexture(
        this.bufferNodes_read,
        100,
        100,
        RGBAFormat,
        FloatType,
      );
      this.textureNode2_read = new DataTexture(
        this.bufferNodes2_read,
        100,
        100,
        RGIntegerFormat,
        UnsignedIntType,
      );
      this.textureNode2_read.internalFormat = 'RG32UI';

      this.textureNodeIndices_read = new DataTexture(
        this.bufferNodesIndices_read,
        size,
        size,
        RedIntegerFormat,
        UnsignedIntType,
      );
      this.textureNodeIndices_read.internalFormat = 'R32UI';

      this.textureCovariance0_read = new DataTexture(
        this.bufferCovariance0_read,
        size,
        size,
        RGBAFormat,
        FloatType,
      );
      this.textureCovariance1_read = new DataTexture(
        this.bufferCovariance1_read,
        size,
        size,
        RGFormat,
        FloatType,
      );
      this.texturePosColor_read = new DataTexture(
        this.bufferPosColor_read,
        size,
        size,
        RGBAIntegerFormat,
        UnsignedIntType,
      );
      this.texturePosColor_read.internalFormat = 'RGBA32UI';

      this.textureHarmonics1_read = new DataTexture(
        this.bufferHarmonics1_read,
        degree1Size,
        degree1Size,
        RedIntegerFormat,
        UnsignedIntType,
      );
      this.textureHarmonics1_read.internalFormat = 'R32UI';
      this.textureHarmonics2_read = new DataTexture(
        this.bufferHarmonics2_read,
        degree2Size,
        degree2Size,
        RedIntegerFormat,
        UnsignedIntType,
      );
      this.textureHarmonics2_read.internalFormat = 'R32UI';
      this.textureHarmonics3_read = new DataTexture(
        this.bufferHarmonics3_read,
        degree3Size,
        degree3Size,
        RedIntegerFormat,
        UnsignedIntType,
      );
      this.textureHarmonics3_read.internalFormat = 'R32UI';

      this.textureVisibilityNodes_read = new DataTexture(
        this.bufferVisibilityNodes,
        2048,
        1,
        RGBAFormat,
      );
      this.textureVisibilityNodes_read.magFilter = NearestFilter;
      this.textureVisibilityNodes_read.minFilter = NearestFilter;

      this.textures.push(this.textureNode_read);
      this.textures.push(this.textureNodeIndices_read);
      this.textures.push(this.textureCovariance0_read);
      this.textures.push(this.textureCovariance1_read);
      this.textures.push(this.texturePosColor_read);
      this.textures.push(this.textureHarmonics1_read);
      this.textures.push(this.textureHarmonics2_read);
      this.textures.push(this.textureHarmonics3_read);
      this.textures.push(this.textureNode2_read);
      this.textures.push(this.textureVisibilityNodes_read);

      this.textures.map((text) => (text.needsUpdate = true));

      this.material.uniforms['posColorTexture'].value = this.texturePosColor_read;
      this.material.uniforms['covarianceTexture0'].value = this.textureCovariance0_read;
      this.material.uniforms['covarianceTexture1'].value = this.textureCovariance1_read;
      this.material.uniforms['nodeTexture'].value = this.textureNode_read;
      this.material.uniforms['nodeTexture2'].value = this.textureNode2_read;
      this.material.uniforms['nodeIndicesTexture'].value = this.textureNodeIndices_read;
      this.material.uniforms['harmonicsTexture1'].value = this.textureHarmonics1_read;
      this.material.uniforms['harmonicsTexture2'].value = this.textureHarmonics2_read;
      this.material.uniforms['harmonicsTexture3'].value = this.textureHarmonics3_read;

      this.material.uniforms.visibleNodes.value = this.textureVisibilityNodes_read;

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

    if (nodesAsString != this.nodesAsString && this.enableSorting) {
      this.nodesAsString = nodesAsString;

      instanceCount = 0;
      nodesCount = 0;
      let maxLevel = 0;

      //Copy the data from the visibility nodes, it uses a separated texture to sync when
      //it is updated in relationship with the other textures.
      this.bufferVisibilityNodes.set(mat.uniforms.visibleNodes.value.image.data);

      mesh.traverseVisible((el) => {
        let m = el as Mesh;
        let g = m.geometry as BufferGeometry;

        if (this.material) {
          this.material.uniforms.maxDepth.value = g.userData.maxDepth;
          this.material.uniforms.maxSplatScale.value = g.userData.maxDepth;
        }

        let pointCloudMaterial = mesh.material as PointCloudMaterial;
        const vnStart = pointCloudMaterial.visibleNodeTextureOffsets.get(el.name)!;
        const level = m.name.length - 1;

        let nodeInfo = [m.position.x, m.position.y, m.position.z, 1];
        let nodeInfo2 = [vnStart, level];
        this.bufferNodes_read.set(nodeInfo, nodesCount * 4);
        this.bufferNodes2_read.set(nodeInfo2, nodesCount * 2);

        this.bufferNodesIndices_read.set(
          new Uint32Array(g.drawRange.count).fill(nodesCount),
          instanceCount,
        );

        //Used for sorting
        this.bufferCenters_read.set(g.getAttribute('raw_position').array, instanceCount * 4);

        //Used for raycasting
        this.bufferPositions_read.set(g.getAttribute('centers').array, instanceCount * 4);
        this.bufferScale_read.set(g.getAttribute('scale').array, instanceCount * 3);
        this.bufferOrientation_read.set(g.getAttribute('orientation').array, instanceCount * 4);

        //Used for rendering
        this.bufferCovariance0_read.set(g.getAttribute('COVARIANCE0').array, instanceCount * 4);
        this.bufferCovariance1_read.set(g.getAttribute('COVARIANCE1').array, instanceCount * 2);
        this.bufferPosColor_read.set(g.getAttribute('POS_COLOR').array, instanceCount * 4);

        if (this.harmonicsEnabled) {
          this.bufferHarmonics1_read.set(g.getAttribute('HARMONICS1').array, instanceCount * 3);
          this.bufferHarmonics2_read.set(g.getAttribute('HARMONICS2').array, instanceCount * 5);
          this.bufferHarmonics3_read.set(g.getAttribute('HARMONICS3').array, instanceCount * 7);
        }

        instanceCount += g.drawRange.count;
        nodesCount++;
      });

      totalMemoryInDisplay = instanceCount * (this.harmonicsEnabled ? 236 : 56);

      if (this.debugMode) {
        console.log('----------------------------');
        console.log('total memory in usage: ' + Math.ceil(totalMemoryUsed / 1000000) + ' MB');
        console.log('total memory displayed: ' + Math.ceil(totalMemoryInDisplay / 1000000) + ' MB');
        console.log('max level displayed: ' + maxLevel);
        console.log('----------------------------');
      }

      this.instanceCount = instanceCount;

      this.texturesNeedUpdate = true;
      this.forceSorting = true;

      this.sortSplats(camera, callback);
    }
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

    if ((this.forceSorting || angleDiff <= 0.99 || positionDiff >= 1.0) && this.enableSorting) {
      let sortMessage = {
        indices: this.indexesBuffer,
        centers: this.bufferCenters_read,
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
            let indexAttribute = this.mesh.geometry.getAttribute('indexes_sorted');
            indexAttribute.array.set(new Int32Array(e.data.dataSorted), 0);
            indexAttribute.needsUpdate = true;

            if (this.texturesNeedUpdate) {
              this.textures.map((text) => (text.needsUpdate = true));
              this.texturesNeedUpdate = false;
            }

            this.mesh.geometry.instanceCount = this.instanceCount;

            callback();
            this.enableSorting = true;
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

    center.x = this.bufferPositions_read[4 * globalID + 0];
    center.y = this.bufferPositions_read[4 * globalID + 1];
    center.z = this.bufferPositions_read[4 * globalID + 2];

    scale.x = this.bufferScale_read[3 * globalID + 0];
    scale.y = this.bufferScale_read[3 * globalID + 1];
    scale.z = this.bufferScale_read[3 * globalID + 2];

    orientation.w = this.bufferOrientation_read[4 * globalID + 0];
    orientation.x = this.bufferOrientation_read[4 * globalID + 1];
    orientation.y = this.bufferOrientation_read[4 * globalID + 2];
    orientation.z = this.bufferOrientation_read[4 * globalID + 3];

    offset.x = this.bufferNodes_read[4 * nodeID + 0];
    offset.y = this.bufferNodes_read[4 * nodeID + 1];
    offset.z = this.bufferNodes_read[4 * nodeID + 2];

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

    //Removing textures
    this.textures.map((text) => text.dispose());
    this.textures = [];

    //kill the buffers
    this.indexesBuffer = null;
    this.bufferCenters_read = null;
    this.bufferPositions_read = null;
    this.bufferScale_read = null;
    this.bufferOrientation_read = null;
    this.bufferPosColor_read = null;
    this.bufferCovariance0_read = null;
    this.bufferCovariance1_read = null;
    this.bufferNodes_read = null;
    this.bufferNodesIndices_read = null;

    //kill the mesh
    this.mesh = null;

    this.enabled = false;
  }

  get splatsEnabled(): boolean {
    return this.enabled;
  }
}
