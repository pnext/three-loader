/**
 * Some types of possible point attribute data formats
 *
 * @class
 */
declare const PointAttributeTypes: PointAttributeTypesType;
type PointAttributeTypesType = {
  [key: string]: PointAttributeTypeType;
};
type PointAttributeTypeType = {
  ordinal: number;
  name: string;
  size: number;
};
export { PointAttributeTypes };
type RangeType = number[] | [number[], number[]];
declare class PointAttribute {
  name: string;
  type: PointAttributeTypeType;
  numElements: number;
  range: RangeType;
  uri: string | undefined;
  byteSize: number;
  description: string;
  initialRange?: RangeType;
  constructor(
    name: string,
    type: PointAttributeTypeType,
    numElements: number,
    range?: RangeType,
    uri?: string | undefined,
  );
}
export { PointAttribute };
export declare const POINT_ATTRIBUTES: {
  [key: string]: PointAttribute;
};
type PAVectorType = {
  name: string;
  attributes: string[];
};
export declare class PointAttributes {
  attributes: PointAttribute[];
  byteSize: number;
  size: number;
  vectors: PAVectorType[];
  constructor(
    pointAttributes?: string[],
    attributes?: PointAttribute[],
    byteSize?: number,
    size?: number,
    vectors?: PAVectorType[],
  );
  add(pointAttribute: PointAttribute): void;
  addVector(vector: PAVectorType): void;
  hasNormals(): boolean;
  getAttribute(attributeName: string): PointAttribute | undefined;
}
