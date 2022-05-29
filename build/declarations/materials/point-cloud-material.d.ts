import { BufferGeometry, Camera, Color, Material, RawShaderMaterial, Scene, Texture, Vector3, Vector4, WebGLRenderer } from 'three';
import { PointCloudOctree } from '../point-cloud-octree';
import { PointCloudOctreeNode } from '../point-cloud-octree-node';
import { ClipMode, IClipPolyhedron } from './clipping';
import { PointColorType, PointOpacityType, PointShape, PointSizeType, TreeType } from './enums';
import { IClassification, IGradient, IUniform } from './types';
export interface IPointCloudMaterialParameters {
    size: number;
    minSize: number;
    maxSize: number;
    treeType: TreeType;
}
export interface IPointCloudMaterialUniforms {
    bbSize: IUniform<[number, number, number]>;
    blendDepthSupplement: IUniform<number>;
    blendHardness: IUniform<number>;
    classificationLUT: IUniform<Texture>;
    clipPolyhedraCount: IUniform<number>;
    clipPlanes: IUniform<Float32Array>;
    clipConToPoly: IUniform<Uint32Array>;
    clipPlaneToCon: IUniform<Uint32Array>;
    clipPlaneToPoly: IUniform<Uint32Array>;
    clipPolyhedronOutside: boolean[];
    highlightIgnoreDepth: boolean;
    highlightPolyhedraCount: IUniform<number>;
    highlightPlanes: IUniform<Float32Array>;
    highlightConToPoly: IUniform<Uint32Array>;
    highlightPlaneToCon: IUniform<Uint32Array>;
    highlightPlaneToPoly: IUniform<Uint32Array>;
    highlightPolyhedronOutside: boolean[];
    highlightPolyhedronColors: IUniform<Float32Array>;
    clipBoxes: IUniform<Float32Array>;
    clipping: IUniform<boolean>;
    numClippingPlanes: IUniform<number>;
    clippingPlanes: IUniform<any[]>;
    depthMap: IUniform<Texture | null>;
    diffuse: IUniform<[number, number, number]>;
    fov: IUniform<number>;
    gradient: IUniform<Texture>;
    heightMax: IUniform<number>;
    heightMin: IUniform<number>;
    intensityBrightness: IUniform<number>;
    intensityContrast: IUniform<number>;
    intensityGamma: IUniform<number>;
    intensityRange: IUniform<[number, number]>;
    level: IUniform<number>;
    maxSize: IUniform<number>;
    minSize: IUniform<number>;
    octreeSize: IUniform<number>;
    opacity: IUniform<number>;
    pcIndex: IUniform<number>;
    rgbBrightness: IUniform<number>;
    rgbContrast: IUniform<number>;
    rgbGamma: IUniform<number>;
    screenHeight: IUniform<number>;
    screenWidth: IUniform<number>;
    size: IUniform<number>;
    spacing: IUniform<number>;
    toModel: IUniform<number[]>;
    transition: IUniform<number>;
    uColor: IUniform<Color>;
    visibleNodes: IUniform<Texture>;
    vnStart: IUniform<number>;
    wClassification: IUniform<number>;
    wElevation: IUniform<number>;
    wIntensity: IUniform<number>;
    wReturnNumber: IUniform<number>;
    wRGB: IUniform<number>;
    wSourceID: IUniform<number>;
    opacityAttenuation: IUniform<number>;
    filterByNormalThreshold: IUniform<number>;
    highlightedPointCoordinate: IUniform<Vector3>;
    highlightedPointColor: IUniform<Vector4>;
    enablePointHighlighting: IUniform<boolean>;
    highlightedPointScale: IUniform<number>;
}
export declare class PointCloudMaterial extends RawShaderMaterial {
    private static helperVec3;
    lights: boolean;
    fog: boolean;
    clipPolyhedraCount: number;
    clipPlanes: number[];
    clipConToPoly: number[];
    clipPlaneToCon: number[];
    clipPlaneToPoly: number[];
    clipPolyhedronOutside: boolean[];
    highlightIgnoreDepth: boolean;
    highlightPolyhedraCount: number;
    highlightPlanes: number[];
    highlightConToPoly: number[];
    highlightPlaneToCon: number[];
    highlightPlaneToPoly: number[];
    highlightPolyhedronOutside: boolean[];
    highlightPolyhedronColors: Color[];
    visibleNodesTexture: Texture | undefined;
    private visibleNodeTextureOffsets;
    private _gradient;
    private gradientTexture;
    private _classification;
    private classificationTexture;
    defines: any;
    uniforms: IPointCloudMaterialUniforms & Record<string, IUniform<any>>;
    bbSize: [number, number, number];
    depthMap: Texture | undefined;
    fov: number;
    heightMax: number;
    heightMin: number;
    intensityBrightness: number;
    intensityContrast: number;
    intensityGamma: number;
    intensityRange: [number, number];
    maxSize: number;
    minSize: number;
    octreeSize: number;
    opacity: number;
    rgbBrightness: number;
    rgbContrast: number;
    rgbGamma: number;
    screenHeight: number;
    screenWidth: number;
    size: number;
    spacing: number;
    transition: number;
    color: Color;
    weightClassification: number;
    weightElevation: number;
    weightIntensity: number;
    weightReturnNumber: number;
    weightRGB: number;
    weightSourceID: number;
    opacityAttenuation: number;
    filterByNormalThreshold: number;
    highlightedPointCoordinate: Vector3;
    highlightedPointColor: Vector4;
    enablePointHighlighting: boolean;
    highlightedPointScale: number;
    useClipBox: boolean;
    weighted: boolean;
    pointColorType: PointColorType;
    pointSizeType: PointSizeType;
    clipMode: ClipMode;
    useEDL: boolean;
    shape: PointShape;
    treeType: TreeType;
    pointOpacityType: PointOpacityType;
    useFilterByNormal: boolean;
    highlightPoint: boolean;
    attributes: {
        position: {
            type: string;
            value: never[];
        };
        color: {
            type: string;
            value: never[];
        };
        normal: {
            type: string;
            value: never[];
        };
        intensity: {
            type: string;
            value: never[];
        };
        classification: {
            type: string;
            value: never[];
        };
        returnNumber: {
            type: string;
            value: never[];
        };
        numberOfReturns: {
            type: string;
            value: never[];
        };
        pointSourceID: {
            type: string;
            value: never[];
        };
        indices: {
            type: string;
            value: never[];
        };
    };
    constructor(parameters?: Partial<IPointCloudMaterialParameters>);
    dispose(): void;
    clearVisibleNodeTextureOffsets(): void;
    updateShaderSource(): void;
    applyDefines(shaderSrc: string): string;
    setHighlightIgnoreDepth(value: any): void;
    copyPolyhedra(other: PointCloudMaterial): void;
    get gradient(): IGradient;
    set gradient(value: IGradient);
    get classification(): IClassification;
    set classification(value: IClassification);
    private recomputeClassification;
    get elevationRange(): [number, number];
    set elevationRange(value: [number, number]);
    getUniform<K extends keyof IPointCloudMaterialUniforms>(name: K): IPointCloudMaterialUniforms[K]['value'];
    setUniform<K extends keyof IPointCloudMaterialUniforms>(name: K, value: IPointCloudMaterialUniforms[K]['value']): void;
    updateMaterial(octree: PointCloudOctree, visibleNodes: PointCloudOctreeNode[], camera: Camera, renderer: WebGLRenderer): void;
    private updateVisibilityTextureData;
    static makeOnBeforeRender(octree: PointCloudOctree, node: PointCloudOctreeNode, pcIndex?: number): (_renderer: WebGLRenderer, _scene: Scene, _camera: Camera, _geometry: BufferGeometry, material: Material) => void;
    setClipPolyhedra(clipPolyhedra: IClipPolyhedron[]): void;
    setHighlightPolyhedra(clipPolyhedra: IClipPolyhedron[]): void;
    setTypePolyhedra(type: string, polyhedra: IClipPolyhedron[]): void;
}