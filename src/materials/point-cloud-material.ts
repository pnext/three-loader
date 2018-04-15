import {
  AdditiveBlending,
  AlwaysDepth,
  Color,
  NearestFilter,
  NoBlending,
  RawShaderMaterial,
  Texture,
  VertexColors,
} from 'three';
import { DEFAULT_CLASSIFICATION } from './classification';
import { ClipMode, IClipBox } from './clipping';
import { PointColorType, PointShape, PointSizeType, TreeType } from './enums';
import { SPECTRAL } from './gradients/spectral';
import {
  generateClassificationTexture,
  generateDataTexture,
  generateGradientTexture,
} from './texture-generation';
import { IClassification, IGradient, IUniform } from './types';

export interface IPointCloudMaterialParameters {
  size: number;
  minSize: number;
  maxSize: number;
  treeType: TreeType;
}

const DEFAULT_RGB_GAMMA = 1;
const DEFAULT_RGB_CONTRAST = 0;
const DEFAULT_RGB_BRIGHTNESS = 0;

export interface IPointCloudMaterialUniforms {
  level: IUniform<number>;
  vnStart: IUniform<number>;
  spacing: IUniform<number>;
  blendHardness: IUniform<number>;
  blendDepthSupplement: IUniform<number>;
  fov: IUniform<number>;
  screenWidth: IUniform<number>;
  screenHeight: IUniform<number>;
  near: IUniform<number>;
  far: IUniform<number>;
  uColor: IUniform<Color>;
  opacity: IUniform<number>;
  size: IUniform<number>;
  minSize: IUniform<number>;
  maxSize: IUniform<number>;
  octreeSize: IUniform<number>;
  bbSize: IUniform<[number, number, number]>;
  heightMin: IUniform<number>;
  heightMax: IUniform<number>;
  clipBoxCount: IUniform<number>;
  visibleNodes: IUniform<Texture>;
  pcIndex: IUniform<number>;
  gradient: IUniform<Texture>;
  classificationLUT: IUniform<Texture>;
  clipBoxes: IUniform<Float32Array>;
  toModel: IUniform<number[]>;
  depthMap: IUniform<Texture | null>;
  diffuse: IUniform<[number, number, number]>;
  transition: IUniform<number>;
  intensityRange: IUniform<[number, number]>;
  intensityGamma: IUniform<number>;
  intensityContrast: IUniform<number>;
  intensityBrightness: IUniform<number>;
  rgbGamma: IUniform<number>;
  rgbContrast: IUniform<number>;
  rgbBrightness: IUniform<number>;
  wRGB: IUniform<number>;
  wIntensity: IUniform<number>;
  wElevation: IUniform<number>;
  wClassification: IUniform<number>;
  wReturnNumber: IUniform<number>;
  wSourceID: IUniform<number>;
}

export class PointCloudMaterial extends RawShaderMaterial {
  lights = false;
  fog = false;

  // Clipping
  numClipBoxes: number = 0;
  clipBoxes: IClipBox[] = [];
  private _clipMode: ClipMode = ClipMode.DISABLED;
  private _useClipBox: boolean = false;

  // Textures
  readonly visibleNodesTexture: Texture;
  private _gradient = SPECTRAL;
  private gradientTexture = generateGradientTexture(this._gradient);
  private _classification: IClassification = DEFAULT_CLASSIFICATION;
  private classificationTexture: Texture = generateClassificationTexture(this._classification);

  uniforms: IPointCloudMaterialUniforms & Record<string, IUniform<any>> = {
    bbSize: { type: 'fv', value: [0, 0, 0] },
    blendDepthSupplement: { type: 'f', value: 0.0 },
    blendHardness: { type: 'f', value: 2.0 },
    classificationLUT: { type: 't', value: this.classificationTexture },
    clipBoxCount: { type: 'f', value: 0 },
    clipBoxes: { type: 'Matrix4fv', value: [] as any },
    depthMap: { type: 't', value: null },
    diffuse: { type: 'fv', value: [1, 1, 1] },
    far: { type: 'f', value: 1.0 },
    fov: { type: 'f', value: 1.0 },
    gradient: { type: 't', value: this.gradientTexture },
    heightMax: { type: 'f', value: 1.0 },
    heightMin: { type: 'f', value: 0.0 },
    intensityBrightness: { type: 'f', value: 0 },
    intensityContrast: { type: 'f', value: 0 },
    intensityGamma: { type: 'f', value: 1 },
    intensityRange: { type: 'fv', value: [0, 65000] },
    isLeafNode: { type: 'b', value: 0 },
    level: { type: 'f', value: 0.0 },
    maxSize: { type: 'f', value: 10.0 },
    minSize: { type: 'f', value: 1.0 },
    near: { type: 'f', value: 0.1 },
    octreeSize: { type: 'f', value: 0 },
    opacity: { type: 'f', value: 1.0 },
    pcIndex: { type: 'f', value: 0 },
    rgbBrightness: { type: 'f', value: DEFAULT_RGB_BRIGHTNESS },
    rgbContrast: { type: 'f', value: DEFAULT_RGB_CONTRAST },
    rgbGamma: { type: 'f', value: DEFAULT_RGB_GAMMA },
    screenHeight: { type: 'f', value: 1.0 },
    screenWidth: { type: 'f', value: 1.0 },
    size: { type: 'f', value: 1 },
    spacing: { type: 'f', value: 1.0 },
    toModel: { type: 'Matrix4f', value: [] },
    transition: { type: 'f', value: 0.5 },
    uColor: { type: 'c', value: new Color(0xffffff) },
    visibleNodes: { type: 't', value: this.visibleNodesTexture },
    vnStart: { type: 'f', value: 0.0 },
    wClassification: { type: 'f', value: 0 },
    wElevation: { type: 'f', value: 0 },
    wIntensity: { type: 'f', value: 0 },
    wReturnNumber: { type: 'f', value: 0 },
    wRGB: { type: 'f', value: 1 },
    wSourceID: { type: 'f', value: 0 },
  };

  attributes = {
    position: { type: 'fv', value: [] },
    color: { type: 'fv', value: [] },
    normal: { type: 'fv', value: [] },
    intensity: { type: 'f', value: [] },
    classification: { type: 'f', value: [] },
    returnNumber: { type: 'f', value: [] },
    numberOfReturns: { type: 'f', value: [] },
    pointSourceID: { type: 'f', value: [] },
    indices: { type: 'fv', value: [] },
  };

  private _pointSizeType: PointSizeType = PointSizeType.ADAPTIVE;
  private _shape: PointShape = PointShape.SQUARE;
  private _pointColorType: PointColorType = PointColorType.RGB;
  private _weighted = false;
  private _treeType: TreeType = TreeType.OCTREE;
  private _useEDL = false;

  constructor(parameters: Partial<IPointCloudMaterialParameters> = {}) {
    super();

    this.visibleNodesTexture = generateDataTexture(2048, 1, new Color(0xffffff));
    this.visibleNodesTexture.minFilter = NearestFilter;
    this.visibleNodesTexture.magFilter = NearestFilter;

    this.setUniform('visibleNodes', this.visibleNodesTexture);

    function getValid<T>(a: T | undefined, b: T): T {
      return a === undefined ? b : a;
    }

    this.treeType = getValid(parameters.treeType, TreeType.OCTREE);
    this.size = getValid(parameters.size, 1.0);
    this.minSize = getValid(parameters.minSize, 1.0);
    this.maxSize = getValid(parameters.maxSize, 50.0);

    this.classification = DEFAULT_CLASSIFICATION;

    this.defaultAttributeValues.normal = [0, 0, 0];
    this.defaultAttributeValues.classification = [0, 0, 0];
    this.defaultAttributeValues.indices = [0, 0, 0, 0];

    this.vertexColors = VertexColors;

    this.updateShaderSource();
    this.needsUpdate = true;
  }

  updateShaderSource() {
    this.vertexShader = this.applyDefines(require('./shaders/pointcloud.vs'));
    this.fragmentShader = this.applyDefines(require('./shaders/pointcloud.fs'));

    if (this.opacity === 1.0) {
      this.blending = NoBlending;
      this.transparent = false;
      this.depthTest = true;
      this.depthWrite = true;
    } else if (this.opacity < 1.0 && !this.useEDL) {
      this.blending = AdditiveBlending;
      this.transparent = true;
      this.depthTest = false;
      this.depthWrite = true;
      this.depthFunc = AlwaysDepth;
    }

    if (this.weighted) {
      this.blending = AdditiveBlending;
      this.transparent = true;
      this.depthTest = true;
      this.depthWrite = false;
    }

    this.needsUpdate = true;
  }

  // tslint:disable:prefer-switch
  applyDefines(shaderSrc: string): string {
    const parts: string[] = [];

    if (this.pointSizeType === PointSizeType.FIXED) {
      parts.push('#define fixed_point_size');
    } else if (this.pointSizeType === PointSizeType.ATTENUATED) {
      parts.push('#define attenuated_point_size');
    } else if (this.pointSizeType === PointSizeType.ADAPTIVE) {
      parts.push('#define adaptive_point_size');
    }

    if (this.shape === PointShape.SQUARE) {
      parts.push('#define square_point_shape');
    } else if (this.shape === PointShape.CIRCLE) {
      parts.push('#define circle_point_shape');
    } else if (this.shape === PointShape.PARABOLOID) {
      parts.push('#define paraboloid_point_shape');
    }

    if (this._useEDL) {
      parts.push('#define use_edl');
    }

    if (this._pointColorType === PointColorType.RGB) {
      parts.push('#define color_type_rgb');
    } else if (this._pointColorType === PointColorType.COLOR) {
      parts.push('#define color_type_color');
    } else if (this._pointColorType === PointColorType.DEPTH) {
      parts.push('#define color_type_depth');
    } else if (this._pointColorType === PointColorType.HEIGHT) {
      parts.push('#define color_type_height');
    } else if (this._pointColorType === PointColorType.INTENSITY) {
      parts.push('#define color_type_intensity');
    } else if (this._pointColorType === PointColorType.INTENSITY_GRADIENT) {
      parts.push('#define color_type_intensity_gradient');
    } else if (this._pointColorType === PointColorType.LOD) {
      parts.push('#define color_type_lod');
    } else if (this._pointColorType === PointColorType.POINT_INDEX) {
      parts.push('#define color_type_point_index');
    } else if (this._pointColorType === PointColorType.CLASSIFICATION) {
      parts.push('#define color_type_classification');
    } else if (this._pointColorType === PointColorType.RETURN_NUMBER) {
      parts.push('#define color_type_return_number');
    } else if (this._pointColorType === PointColorType.SOURCE) {
      parts.push('#define color_type_source');
    } else if (this._pointColorType === PointColorType.NORMAL) {
      parts.push('#define color_type_normal');
    } else if (this._pointColorType === PointColorType.PHONG) {
      parts.push('#define color_type_phong');
    } else if (this._pointColorType === PointColorType.RGB_HEIGHT) {
      parts.push('#define color_type_rgb_height');
    } else if (this._pointColorType === PointColorType.COMPOSITE) {
      parts.push('#define color_type_composite');
    }

    // We only perform gamma and brightness/contrast calculations per point if values are specified.
    if (
      this.rgbGamma !== DEFAULT_RGB_GAMMA ||
      this.rgbBrightness !== DEFAULT_RGB_BRIGHTNESS ||
      this.rgbContrast !== DEFAULT_RGB_CONTRAST
    ) {
      parts.push('#define use_rgb_gamma_contrast_brightness');
    }

    if (this.clipMode === ClipMode.DISABLED) {
      parts.push('#define clip_disabled');
    } else if (this.clipMode === ClipMode.CLIP_OUTSIDE) {
      parts.push('#define clip_outside');
    } else if (this.clipMode === ClipMode.HIGHLIGHT_INSIDE) {
      parts.push('#define clip_highlight_inside');
    }

    if (this._treeType === TreeType.OCTREE) {
      parts.push('#define tree_type_octree');
    } else if (this._treeType === TreeType.KDTREE) {
      parts.push('#define tree_type_kdtree');
    }

    if (this.weighted) {
      parts.push('#define weighted_splats');
    }

    if (this.numClipBoxes > 0) {
      parts.push('#define use_clip_box');
    }

    parts.push(shaderSrc);

    return parts.join('\n');
  }
  // tslint:enable:prefer-switch

  setClipBoxes(clipBoxes: IClipBox[]): void {
    if (!clipBoxes) {
      return;
    }

    this.clipBoxes = clipBoxes;

    const doUpdate =
      this.numClipBoxes !== clipBoxes.length && (clipBoxes.length === 0 || this.numClipBoxes === 0);

    this.numClipBoxes = clipBoxes.length;
    this.setUniform('clipBoxCount', this.numClipBoxes);

    if (doUpdate) {
      this.updateShaderSource();
    }

    const clipBoxesLength = this.numClipBoxes * 16;
    const clipBoxesArray = new Float32Array(clipBoxesLength);

    for (let i = 0; i < this.numClipBoxes; i++) {
      const box = clipBoxes[i];

      clipBoxesArray.set(box.inverse.elements, 16 * i);
    }

    for (let i = 0; i < clipBoxesLength; i++) {
      if (isNaN(clipBoxesArray[i])) {
        clipBoxesArray[i] = Infinity;
      }
    }

    this.setUniform('clipBoxes', clipBoxesArray);
  }

  get gradient(): IGradient {
    return this._gradient;
  }

  set gradient(value: IGradient) {
    if (this._gradient !== value) {
      this._gradient = value;
      this.gradientTexture = generateGradientTexture(this._gradient);
      this.setUniform('gradient', this.gradientTexture);
    }
  }

  get classification(): IClassification {
    return this._classification;
  }

  set classification(value: IClassification) {
    const copy: IClassification = {} as any;
    for (const key of Object.keys(value)) {
      copy[key] = value[key].clone();
    }

    let isEqual = false;
    if (this._classification === undefined) {
      isEqual = false;
    } else {
      isEqual = Object.keys(copy).length === Object.keys(this._classification).length;

      for (const key of Object.keys(copy)) {
        isEqual = isEqual && this._classification[key] !== undefined;
        isEqual = isEqual && copy[key].equals(this._classification[key]);
      }
    }

    if (!isEqual) {
      this._classification = copy;
      this.recomputeClassification();
    }
  }

  private recomputeClassification(): void {
    this.classificationTexture = generateClassificationTexture(this._classification);
    this.setUniform('classificationLUT', this.classificationTexture);
  }

  get spacing(): number {
    return this.getUniform('spacing');
  }

  set spacing(value: number) {
    this.setUniform('spacing', value);
  }

  get useClipBox(): boolean {
    return this._useClipBox;
  }

  set useClipBox(value: boolean) {
    if (this._useClipBox !== value) {
      this._useClipBox = value;
      this.updateShaderSource();
    }
  }

  get weighted(): boolean {
    return this._weighted;
  }

  set weighted(value: boolean) {
    if (this._weighted !== value) {
      this._weighted = value;
      this.updateShaderSource();
    }
  }

  get fov(): number {
    return this.getUniform('fov');
  }

  set fov(value: number) {
    this.setUniform('fov', value);
  }

  get screenWidth(): number {
    return this.getUniform('screenWidth');
  }

  set screenWidth(value: number) {
    this.setUniform('screenWidth', value);
  }

  get screenHeight(): number {
    return this.getUniform('screenHeight');
  }

  set screenHeight(value: number) {
    this.setUniform('screenHeight', value);
  }

  get near(): number {
    return this.getUniform('near');
  }

  set near(value: number) {
    this.setUniform('near', value);
  }

  get far(): number {
    return this.getUniform('far');
  }

  set far(value: number) {
    this.setUniform('far', value);
  }

  get opacity(): number {
    return this.getUniform('opacity');
  }

  set opacity(value: number) {
    if (this.uniforms && this.uniforms.opacity.value !== value) {
      this.setUniform('opacity', value);
      this.updateShaderSource();
    }
  }

  get pointColorType(): PointColorType {
    return this._pointColorType;
  }

  set pointColorType(value: PointColorType) {
    if (this._pointColorType !== value) {
      this._pointColorType = value;
      this.updateShaderSource();
    }
  }

  get depthMap(): Texture | null {
    return this.getUniform('depthMap');
  }

  set depthMap(value: Texture | null) {
    if (this.depthMap !== value) {
      this.setUniform('depthMap', value);
      this.updateShaderSource();
    }
  }

  get pointSizeType(): PointSizeType {
    return this._pointSizeType;
  }

  set pointSizeType(value: PointSizeType) {
    if (this._pointSizeType !== value) {
      this._pointSizeType = value;
      this.updateShaderSource();
    }
  }

  get clipMode(): ClipMode {
    return this._clipMode;
  }

  set clipMode(value: ClipMode) {
    if (this._clipMode !== value) {
      this._clipMode = value;
      this.updateShaderSource();
    }
  }

  get useEDL(): boolean {
    return this._useEDL;
  }

  set useEDL(value: boolean) {
    if (this._useEDL !== value) {
      this._useEDL = value;
      this.updateShaderSource();
    }
  }

  get color(): Color {
    return this.getUniform('uColor');
  }

  set color(value: Color) {
    if (!this.uniforms.uColor.value.equals(value)) {
      this.uniforms.uColor.value.copy(value);
    }
  }

  get shape(): PointShape {
    return this._shape;
  }

  set shape(value: PointShape) {
    if (this._shape !== value) {
      this._shape = value;
      this.updateShaderSource();
    }
  }

  get treeType(): TreeType {
    return this._treeType;
  }

  set treeType(value: TreeType) {
    if (this._treeType !== value) {
      this._treeType = value;
      this.updateShaderSource();
    }
  }

  get bbSize(): [number, number, number] {
    return this.getUniform('bbSize');
  }

  set bbSize(value: [number, number, number]) {
    this.setUniform('bbSize', value);
  }

  get size(): number {
    return this.getUniform('size');
  }

  set size(value: number) {
    this.setUniform('size', value);
  }

  get elevationRange(): [number, number] {
    return [this.heightMin, this.heightMax];
  }

  set elevationRange(value: [number, number]) {
    this.heightMin = value[0];
    this.heightMax = value[1];
  }

  get heightMin(): number {
    return this.getUniform('heightMin');
  }

  set heightMin(value: number) {
    this.setUniform('heightMin', value);
  }

  get heightMax(): number {
    return this.getUniform('heightMax');
  }

  set heightMax(value: number) {
    this.setUniform('heightMax', value);
  }

  get transition(): number {
    return this.getUniform('transition');
  }

  set transition(value: number) {
    this.setUniform('transition', value);
  }

  get intensityRange(): [number, number] {
    return this.getUniform('intensityRange');
  }

  set intensityRange(value: [number, number]) {
    this.setUniform('intensityRange', value);
  }

  get intensityGamma(): number {
    return this.getUniform('intensityGamma');
  }

  set intensityGamma(value: number) {
    this.setUniform('intensityGamma', value);
  }

  get intensityContrast(): number {
    return this.getUniform('intensityContrast');
  }

  set intensityContrast(value: number) {
    this.setUniform('intensityContrast', value);
  }

  get intensityBrightness(): number {
    return this.getUniform('intensityBrightness');
  }

  set intensityBrightness(value: number) {
    this.setUniform('intensityBrightness', value);
  }

  get rgbGamma(): number {
    return this.getUniform('rgbGamma');
  }

  set rgbGamma(value: number) {
    if (value !== this.rgbGamma) {
      this.setUniform('rgbGamma', value);
      this.updateShaderSource();
    }
  }

  get rgbContrast(): number {
    return this.getUniform('rgbContrast');
  }

  set rgbContrast(value: number) {
    if (value !== this.rgbContrast) {
      this.setUniform('rgbContrast', value);
      this.updateShaderSource();
    }
  }

  get rgbBrightness(): number {
    return this.getUniform('rgbBrightness');
  }

  set rgbBrightness(value: number) {
    if (value !== this.rgbBrightness) {
      this.setUniform('rgbBrightness', value);
      this.updateShaderSource();
    }
  }

  get weightRGB(): number {
    return this.getUniform('wRGB');
  }

  set weightRGB(value: number) {
    this.setUniform('wRGB', value);
  }

  get weightIntensity(): number {
    return this.getUniform('wIntensity');
  }

  set weightIntensity(value: number) {
    this.setUniform('wIntensity', value);
  }

  get weightElevation(): number {
    return this.getUniform('wElevation');
  }

  set weightElevation(value: number) {
    this.setUniform('wElevation', value);
  }

  get weightClassification(): number {
    return this.getUniform('wClassification');
  }

  set weightClassification(value: number) {
    this.setUniform('wClassification', value);
  }

  get weightReturnNumber(): number {
    return this.getUniform('wReturnNumber');
  }

  set weightReturnNumber(value: number) {
    this.setUniform('wReturnNumber', value);
  }

  get weightSourceID(): number {
    return this.getUniform('wSourceID');
  }

  set weightSourceID(value: number) {
    this.setUniform('wSourceID', value);
  }

  get minSize(): number {
    return this.getUniform('minSize');
  }

  set minSize(value: number) {
    this.setUniform('minSize', value);
  }

  get maxSize(): number {
    return this.getUniform('maxSize');
  }

  set maxSize(value: number) {
    this.setUniform('maxSize', value);
  }

  getUniform<K extends keyof IPointCloudMaterialUniforms>(
    name: K,
  ): IPointCloudMaterialUniforms[K]['value'] {
    return this.uniforms[name].value;
  }

  setUniform<K extends keyof IPointCloudMaterialUniforms>(
    name: K,
    value: IPointCloudMaterialUniforms[K]['value'],
  ): void {
    this.uniforms[name].value = value;
  }
}
