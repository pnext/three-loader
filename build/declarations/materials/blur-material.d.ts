import { ShaderMaterial, Texture } from 'three';
import { IUniform } from './types';
export interface IBlurMaterialUniforms {
    [name: string]: IUniform<any>;
    screenWidth: IUniform<number>;
    screenHeight: IUniform<number>;
    map: IUniform<Texture | null>;
}
export declare class BlurMaterial extends ShaderMaterial {
    vertexShader: any;
    fragmentShader: any;
    uniforms: IBlurMaterialUniforms;
}
