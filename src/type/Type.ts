export type Coordinate = {
    x: number;
    y: number;
};

export type BoundingBox = {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
};

export type PolyDataSet = {
    Box: BoundingBox;
    NumParts: number;
    NumPoints: number;
    Parts: number[];
    PartsCoordinates: Array<Coordinate>[];
};

export type ShapeHeader = {
    fileCode: number;
    fileLength: number;
    version: number;
    shapeType: number;
    boundingBox: BoundingBox;
};

export interface ShapeContents {
    contents: Coordinate[] | PolyDataSet;
}

export interface Shape {
    shapeHeader: ShapeHeader;
    shapeContents: ShapeContents;
}
