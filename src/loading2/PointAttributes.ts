/**
 * Some types of possible point attribute data formats
 *
 * @class
 */
const PointAttributeTypes: PointAttributeTypesType = {
	DATA_TYPE_DOUBLE: {ordinal: 0, name: 'double', size: 8},
	DATA_TYPE_FLOAT: {ordinal: 1, name: 'float', size: 4},
	DATA_TYPE_INT8: {ordinal: 2, name: 'int8', size: 1},
	DATA_TYPE_UINT8: {ordinal: 3, name: 'uint8', size: 1},
	DATA_TYPE_INT16: {ordinal: 4, name: 'int16', size: 2},
	DATA_TYPE_UINT16: {ordinal: 5, name: 'uint16', size: 2},
	DATA_TYPE_INT32: {ordinal: 6, name: 'int32', size: 4},
	DATA_TYPE_UINT32: {ordinal: 7, name: 'uint32', size: 4},
	DATA_TYPE_INT64: {ordinal: 8, name: 'int64', size: 8},
	DATA_TYPE_UINT64: {ordinal: 9, name: 'uint64', size: 8}
};

type PointAttributeTypesType = {
	[key: string]: PointAttributeTypeType;
};

type PointAttributeTypeType = {
	ordinal: number;
	name: string;
	size: number;
};

let i = 0;
for (let obj in PointAttributeTypes) 
{
	PointAttributeTypes[i] = PointAttributeTypes[obj];
	i++;
}

export {PointAttributeTypes};

type RangeType = number[] | [number[], number[]]

// Class that represents a certain point attribute
class PointAttribute
{
	byteSize: number;

	description: string;

	public initialRange?: RangeType;

	constructor(
		public name: string,
		public type: PointAttributeTypeType,
		public numElements: number,
		public range: RangeType = [Infinity, -Infinity]
	)
	{
		this.byteSize = this.numElements * this.type.size;
		this.description = '';
	}
}

export {PointAttribute};

// Map that represents all point attributes, these were previoiusly properties of the PointAttribute class
export const POINT_ATTRIBUTES: {[key: string]: PointAttribute} = {
	POSITION_CARTESIAN: new PointAttribute('POSITION_CARTESIAN', PointAttributeTypes.DATA_TYPE_FLOAT, 3),
	RGBA_PACKED: new PointAttribute('COLOR_PACKED', PointAttributeTypes.DATA_TYPE_INT8, 4),
	COLOR_PACKED: new PointAttribute('COLOR_PACKED', PointAttributeTypes.DATA_TYPE_INT8, 4),
	RGB_PACKED: new PointAttribute('COLOR_PACKED', PointAttributeTypes.DATA_TYPE_INT8, 3),
	NORMAL_FLOATS: new PointAttribute('NORMAL_FLOATS', PointAttributeTypes.DATA_TYPE_FLOAT, 3),
	INTENSITY: new PointAttribute('INTENSITY', PointAttributeTypes.DATA_TYPE_UINT16, 1),
	CLASSIFICATION: new PointAttribute('CLASSIFICATION', PointAttributeTypes.DATA_TYPE_UINT8, 1),
	NORMAL_SPHEREMAPPED: new PointAttribute('NORMAL_SPHEREMAPPED', PointAttributeTypes.DATA_TYPE_UINT8, 2),
	NORMAL_OCT16: new PointAttribute('NORMAL_OCT16', PointAttributeTypes.DATA_TYPE_UINT8, 2),
	NORMAL: new PointAttribute('NORMAL', PointAttributeTypes.DATA_TYPE_FLOAT, 3),
	RETURN_NUMBER: new PointAttribute('RETURN_NUMBER', PointAttributeTypes.DATA_TYPE_UINT8, 1),
	NUMBER_OF_RETURNS: new PointAttribute('NUMBER_OF_RETURNS', PointAttributeTypes.DATA_TYPE_UINT8, 1),
	SOURCE_ID: new PointAttribute('SOURCE_ID', PointAttributeTypes.DATA_TYPE_UINT16, 1),
	INDICES: new PointAttribute('INDICES', PointAttributeTypes.DATA_TYPE_UINT32, 1),
	SPACING: new PointAttribute('SPACING', PointAttributeTypes.DATA_TYPE_FLOAT, 1),
	GPS_TIME: new PointAttribute('GPS_TIME', PointAttributeTypes.DATA_TYPE_DOUBLE, 1)
};

type PAVectorType = {
	name: string;
	attributes: string[];
}

// Instantiated during loading
export class PointAttributes
{


	// pointAttributes will be a list of strings
	constructor(pointAttributes?: string[],
				public attributes: PointAttribute[] = [],
				public byteSize: number = 0,
				public size: number = 0,
				public vectors: PAVectorType[]=[]
	)
	{

		if (pointAttributes != null) 
		{
			for (let i = 0; i < pointAttributes.length; i++) 
			{
				let pointAttributeName = pointAttributes[i];
				let pointAttribute = POINT_ATTRIBUTES[pointAttributeName];
				this.attributes.push(pointAttribute);
				this.byteSize += pointAttribute.byteSize;
				this.size++;
			}
		}
	}

	// I hate these argument names that are so similar to each other but have completely different types
	add(pointAttribute: PointAttribute)
	{
		this.attributes.push(pointAttribute);
		this.byteSize += pointAttribute.byteSize;
		this.size++;
	}

	addVector(vector: PAVectorType)
	{
		this.vectors.push(vector);
	}

	hasNormals()
	{
		for (let name in this.attributes) 
		{
			let pointAttribute = this.attributes[name];
			if (
				pointAttribute === POINT_ATTRIBUTES.NORMAL_SPHEREMAPPED ||
				pointAttribute === POINT_ATTRIBUTES.NORMAL_FLOATS ||
				pointAttribute === POINT_ATTRIBUTES.NORMAL ||
				pointAttribute === POINT_ATTRIBUTES.NORMAL_OCT16) 
			{
				return true;
			}
		}

		return false;
	}

}
