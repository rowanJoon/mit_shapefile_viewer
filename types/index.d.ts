export type BoundingBox = {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
};

export type ShapeHeader = {
    fileCode: number;
    fileLength: number;
    version: number;
    shapeType: number;
    boundingBox: BoundingBox;
};

export type Coordinate = {
    x: number;
    y: number;
};
