export declare enum PointSizeType {
    FIXED = 0,
    ATTENUATED = 1,
    ADAPTIVE = 2
}
export declare enum PointShape {
    SQUARE = 0,
    CIRCLE = 1,
    PARABOLOID = 2
}
export declare enum TreeType {
    OCTREE = 0,
    KDTREE = 1
}
export declare enum PointOpacityType {
    FIXED = 0,
    ATTENUATED = 1
}
export declare enum PointColorType {
    RGB = 0,
    COLOR = 1,
    DEPTH = 2,
    HEIGHT = 3,
    ELEVATION = 3,
    INTENSITY = 4,
    INTENSITY_GRADIENT = 5,
    LOD = 6,
    LEVEL_OF_DETAIL = 6,
    POINT_INDEX = 7,
    CLASSIFICATION = 8,
    RETURN_NUMBER = 9,
    SOURCE = 10,
    NORMAL = 11,
    PHONG = 12,
    RGB_HEIGHT = 13,
    COMPOSITE = 50
}
export declare enum NormalFilteringMode {
    ABSOLUTE_NORMAL_FILTERING_MODE = 1,
    LESS_EQUAL_NORMAL_FILTERING_MODE = 2,
    GREATER_NORMAL_FILTERING_MODE = 3
}
export declare enum PointCloudMixingMode {
    CHECKBOARD = 1,
    STRIPES = 2
}
