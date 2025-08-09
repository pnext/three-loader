import {
  RGBAIntegerFormat,
  UnsignedIntType,
  DataTexture,
  RGBAFormat,
  FloatType,
  RGFormat,
  RedIntegerFormat,
  Texture,
  NearestFilter,
  RGIntegerFormat,
} from 'three';

export class GeometryData {
  public indexesBuffer: any;

  public textures: Map<String, Texture> = new Map();
  public buffers: Map<String, Int32Array> = new Map();

  private textureSorted: any;
  private texturePosColor: any;
  private textureCovariance0: any;
  private textureCovariance1: any;
  private textureNode: any;
  private textureNode2: any;
  private textureNodeIndices: any;
  private textureVisibilityNodes: any;
  private textureHarmonics1: any;
  private textureHarmonics2: any;
  private textureHarmonics3: any;

  private bufferSorted: any;
  private bufferPosColor: any;
  private bufferCovariance0: any;
  private bufferCovariance1: any;
  private bufferNodes: any;
  private bufferNodes2: any;
  private bufferNodesIndices: any;
  private bufferVisibilityNodes: any;
  private bufferHarmonics1: any;
  private bufferHarmonics2: any;
  private bufferHarmonics3: any;

  private bufferCenters: any;
  private bufferPositions: any;
  private bufferScale: any;
  private bufferOrientation: any;

  constructor(maxPointBudget: number, renderHamonics = false) {
    this.indexesBuffer = new Int32Array(maxPointBudget);
    let indexesToSort = new Int32Array(maxPointBudget);

    for (let i = 0; i < maxPointBudget; i++) {
      this.indexesBuffer[i] = i;
      indexesToSort[i] = i;
    }

    //Create the global textures
    let size = Math.ceil(Math.sqrt(maxPointBudget));

    //For the harmonics
    let degree1Size = renderHamonics ? Math.ceil(Math.sqrt(maxPointBudget * 3)) : 1;
    let degree2Size = renderHamonics ? Math.ceil(Math.sqrt(maxPointBudget * 5)) : 1;
    let degree3Size = renderHamonics ? Math.ceil(Math.sqrt(maxPointBudget * 7)) : 1;

    this.bufferCenters = new Float32Array(size * size * 4);
    this.bufferPositions = new Float32Array(size * size * 4);
    this.bufferScale = new Float32Array(size * size * 3);
    this.bufferOrientation = new Float32Array(size * size * 4);

    this.bufferSorted = new Uint32Array(maxPointBudget);
    this.bufferOrientation = new Float32Array(size * size * 4);
    this.bufferPosColor = new Uint32Array(size * size * 4);
    this.bufferCovariance0 = new Float32Array(size * size * 4);
    this.bufferCovariance1 = new Float32Array(size * size * 2);
    this.bufferNodes = new Float32Array(100 * 100 * 4);
    this.bufferNodes2 = new Uint32Array(100 * 100 * 2);
    this.bufferNodesIndices = new Uint32Array(size * size);
    this.bufferVisibilityNodes = new Uint8Array(2048 * 4);
    this.bufferHarmonics1 = new Uint32Array(degree1Size * degree1Size);
    this.bufferHarmonics2 = new Uint32Array(degree2Size * degree2Size);
    this.bufferHarmonics3 = new Uint32Array(degree3Size * degree3Size);

    //This should be able to save up to 10000 nodes
    this.textureNode = new DataTexture(this.bufferNodes, 100, 100, RGBAFormat, FloatType);
    this.textureNode2 = new DataTexture(
      this.bufferNodes2,
      100,
      100,
      RGIntegerFormat,
      UnsignedIntType,
    );
    this.textureNode2.internalFormat = 'RG32UI';

    this.textureSorted = new DataTexture(
      this.bufferSorted,
      size,
      size,
      RedIntegerFormat,
      UnsignedIntType,
    );
    this.textureSorted.internalFormat = 'R32UI';

    this.textureNodeIndices = new DataTexture(
      this.bufferNodesIndices,
      size,
      size,
      RedIntegerFormat,
      UnsignedIntType,
    );
    this.textureNodeIndices.internalFormat = 'R32UI';

    this.textureCovariance0 = new DataTexture(
      this.bufferCovariance0,
      size,
      size,
      RGBAFormat,
      FloatType,
    );
    this.textureCovariance1 = new DataTexture(
      this.bufferCovariance1,
      size,
      size,
      RGFormat,
      FloatType,
    );
    this.texturePosColor = new DataTexture(
      this.bufferPosColor,
      size,
      size,
      RGBAIntegerFormat,
      UnsignedIntType,
    );
    this.texturePosColor.internalFormat = 'RGBA32UI';

    this.textureHarmonics1 = new DataTexture(
      this.bufferHarmonics1,
      degree1Size,
      degree1Size,
      RedIntegerFormat,
      UnsignedIntType,
    );
    this.textureHarmonics1.internalFormat = 'R32UI';
    this.textureHarmonics2 = new DataTexture(
      this.bufferHarmonics2,
      degree2Size,
      degree2Size,
      RedIntegerFormat,
      UnsignedIntType,
    );
    this.textureHarmonics2.internalFormat = 'R32UI';
    this.textureHarmonics3 = new DataTexture(
      this.bufferHarmonics3,
      degree3Size,
      degree3Size,
      RedIntegerFormat,
      UnsignedIntType,
    );
    this.textureHarmonics3.internalFormat = 'R32UI';

    this.textureVisibilityNodes = new DataTexture(this.bufferVisibilityNodes, 2048, 1, RGBAFormat);
    this.textureVisibilityNodes.magFilter = NearestFilter;
    this.textureVisibilityNodes.minFilter = NearestFilter;

    this.textures.set('sorted', this.textureSorted);
    this.textures.set('node', this.textureNode);
    this.textures.set('node2', this.textureNode2);
    this.textures.set('nodeIndices', this.textureNodeIndices);
    this.textures.set('covariance0', this.textureCovariance0);
    this.textures.set('covariance1', this.textureCovariance1);
    this.textures.set('posColor', this.texturePosColor);
    this.textures.set('harmonics1', this.textureHarmonics1);
    this.textures.set('harmonics2', this.textureHarmonics2);
    this.textures.set('harmonics3', this.textureHarmonics3);
    this.textures.set('visibility', this.textureVisibilityNodes);
    this.textures.forEach((text) => (text.needsUpdate = true));

    this.buffers.set('sorted', this.bufferSorted);
    this.buffers.set('centers', this.bufferCenters);
    this.buffers.set('scale', this.bufferScale);
    this.buffers.set('orientation', this.bufferOrientation);
    this.buffers.set('positions', this.bufferPositions);
    this.buffers.set('node', this.bufferNodes);
    this.buffers.set('node2', this.bufferNodes2);
    this.buffers.set('nodeIndices', this.bufferNodesIndices);
    this.buffers.set('covariance0', this.bufferCovariance0);
    this.buffers.set('covariance1', this.bufferCovariance1);
    this.buffers.set('posColor', this.bufferPosColor);
    this.buffers.set('harmonics1', this.bufferHarmonics1);
    this.buffers.set('harmonics2', this.bufferHarmonics2);
    this.buffers.set('harmonics3', this.bufferHarmonics3);
    this.buffers.set('visibility', this.bufferVisibilityNodes);
  }

  dispose() {}
}
