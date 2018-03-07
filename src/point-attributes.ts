// -------------------------------------------------------------------------------------------------
// Converted to Typescript and adapted from https://github.com/potree/potree
// -------------------------------------------------------------------------------------------------

export enum PointAttributeName {
  POSITION_CARTESIAN = 0, // float x, y, z;
  COLOR_PACKED = 1, // byte r, g, b, a; 	I = [0,1]
  COLOR_FLOATS_1 = 2, // float r, g, b; 		I = [0,1]
  COLOR_FLOATS_255 = 3, // float r, g, b; 		I = [0,255]
  NORMAL_FLOATS = 4, // float x, y, z;
  FILLER = 5,
  INTENSITY = 6,
  CLASSIFICATION = 7,
  NORMAL_SPHEREMAPPED = 8,
  NORMAL_OCT16 = 9,
  NORMAL = 10,
}

export interface PointAttributeType {
  ordinal: number;
  size: number;
}

export const POINT_ATTRIBUTE_TYPES: Record<string, PointAttributeType> = {
  DATA_TYPE_DOUBLE: { ordinal: 0, size: 8 },
  DATA_TYPE_FLOAT: { ordinal: 1, size: 4 },
  DATA_TYPE_INT8: { ordinal: 2, size: 1 },
  DATA_TYPE_UINT8: { ordinal: 3, size: 1 },
  DATA_TYPE_INT16: { ordinal: 4, size: 2 },
  DATA_TYPE_UINT16: { ordinal: 5, size: 2 },
  DATA_TYPE_INT32: { ordinal: 6, size: 4 },
  DATA_TYPE_UINT32: { ordinal: 7, size: 4 },
  DATA_TYPE_INT64: { ordinal: 8, size: 8 },
  DATA_TYPE_UINT64: { ordinal: 9, size: 8 },
};

export interface IPointAttribute {
  name: PointAttributeName;
  type: PointAttributeType;
  numElements: number;
  byteSize: number;
}

export interface IPointAttributes {
  attributes: IPointAttribute[];
  byteSize: number;
  size: number;
}

function makePointAttribute(
  name: PointAttributeName,
  type: PointAttributeType,
  numElements: number,
): IPointAttribute {
  return {
    name,
    type,
    numElements,
    byteSize: numElements * type.size,
  };
}

const RGBA_PACKED = makePointAttribute(
  PointAttributeName.COLOR_PACKED,
  POINT_ATTRIBUTE_TYPES.DATA_TYPE_INT8,
  4,
);

export const POINT_ATTRIBUTES = {
  POSITION_CARTESIAN: makePointAttribute(
    PointAttributeName.POSITION_CARTESIAN,
    POINT_ATTRIBUTE_TYPES.DATA_TYPE_FLOAT,
    3,
  ),
  RGBA_PACKED,
  COLOR_PACKED: RGBA_PACKED,
  RGB_PACKED: makePointAttribute(
    PointAttributeName.COLOR_PACKED,
    POINT_ATTRIBUTE_TYPES.DATA_TYPE_INT8,
    3,
  ),
  NORMAL_FLOATS: makePointAttribute(
    PointAttributeName.NORMAL_FLOATS,
    POINT_ATTRIBUTE_TYPES.DATA_TYPE_FLOAT,
    3,
  ),
  FILLER_1B: makePointAttribute(
    PointAttributeName.FILLER,
    POINT_ATTRIBUTE_TYPES.DATA_TYPE_UINT8,
    1,
  ),
  INTENSITY: makePointAttribute(
    PointAttributeName.INTENSITY,
    POINT_ATTRIBUTE_TYPES.DATA_TYPE_UINT16,
    1,
  ),
  CLASSIFICATION: makePointAttribute(
    PointAttributeName.CLASSIFICATION,
    POINT_ATTRIBUTE_TYPES.DATA_TYPE_UINT8,
    1,
  ),
  NORMAL_SPHEREMAPPED: makePointAttribute(
    PointAttributeName.NORMAL_SPHEREMAPPED,
    POINT_ATTRIBUTE_TYPES.DATA_TYPE_UINT8,
    2,
  ),
  NORMAL_OCT16: makePointAttribute(
    PointAttributeName.NORMAL_OCT16,
    POINT_ATTRIBUTE_TYPES.DATA_TYPE_UINT8,
    2,
  ),
  NORMAL: makePointAttribute(PointAttributeName.NORMAL, POINT_ATTRIBUTE_TYPES.DATA_TYPE_FLOAT, 3),
};

export type PointAttributeStringName = keyof typeof POINT_ATTRIBUTES;

export class PointAttributes implements IPointAttributes {
  attributes: IPointAttribute[] = [];
  byteSize: number = 0;
  size: number = 0;

  constructor(pointAttributeNames: PointAttributeStringName[] = []) {
    for (let i = 0; i < pointAttributeNames.length; i++) {
      const pointAttributeName = pointAttributeNames[i];
      const pointAttribute = POINT_ATTRIBUTES[pointAttributeName];
      this.attributes.push(pointAttribute);
      this.byteSize += pointAttribute.byteSize;
      this.size++;
    }
  }

  add(pointAttribute: IPointAttribute): void {
    this.attributes.push(pointAttribute);
    this.byteSize += pointAttribute.byteSize;
    this.size++;
  }

  hasColors(): boolean {
    return this.attributes.find(isColorAttribute) !== undefined;
  }

  hasNormals(): boolean {
    return this.attributes.find(isNormalAttribute) !== undefined;
  }
}

function isColorAttribute({ name }: IPointAttribute): boolean {
  return name === PointAttributeName.COLOR_PACKED;
}

function isNormalAttribute({ name }: IPointAttribute): boolean {
  return (
    name === PointAttributeName.NORMAL_SPHEREMAPPED ||
    name === PointAttributeName.NORMAL_FLOATS ||
    name === PointAttributeName.NORMAL ||
    name === PointAttributeName.NORMAL_OCT16
  );
}
