import { Color, IUniform as IThreeUniform, Vector4 } from 'three';
export declare type IGradient = [number, Color][];
export interface IClassification {
    [value: string]: Vector4;
    DEFAULT: Vector4;
}
export interface IUniform<T> extends IThreeUniform {
    type: string;
    value: T;
}
