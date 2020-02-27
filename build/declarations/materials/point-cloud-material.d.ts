import { Color, RawShaderMaterial, Texture } from 'three';
import { ClipMode, IClipBox } from './clipping';
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
    clipBoxCount: IUniform<number>;
    clipBoxes: IUniform<Float32Array>;
    depthMap: IUniform<Texture | null>;
    diffuse: IUniform<[number, number, number]>;
    far: IUniform<number>;
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
    near: IUniform<number>;
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
}
export declare class PointCloudMaterial extends RawShaderMaterial {
    lights: boolean;
    fog: boolean;
    numClipBoxes: number;
    clipBoxes: IClipBox[];
    visibleNodesTexture: Texture | undefined;
    private _gradient;
    private gradientTexture;
    private _classification;
    private classificationTexture;
    uniforms: IPointCloudMaterialUniforms & Record<string, IUniform<any>>;
    bbSize: [number, number, number];
    depthMap: Texture | undefined;
    far: number;
    fov: number;
    heightMax: number;
    heightMin: number;
    intensityBrightness: number;
    intensityContrast: number;
    intensityGamma: number;
    intensityRange: [number, number];
    maxSize: number;
    minSize: number;
    near: number;
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
    updateShaderSource(): void;
    applyDefines(shaderSrc: string): string;
    setClipBoxes(clipBoxes: IClipBox[]): void;
    get gradient(): IGradient;
    set gradient(value: IGradient);
    get classification(): IClassification;
    set classification(value: IClassification);
    private recomputeClassification;
    get elevationRange(): [number, number];
    set elevationRange(value: [number, number]);
    getUniform<K extends keyof IPointCloudMaterialUniforms>(name: K): IPointCloudMaterialUniforms[K]['value'];
    setUniform<K extends keyof IPointCloudMaterialUniforms>(name: K, value: IPointCloudMaterialUniforms[K]['value']): void;
}
