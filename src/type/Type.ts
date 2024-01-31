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

export type GeoCanvasInteract = {
    zoom: number;
    panX: number;
    panY: number;
    isDragging: boolean;
    dragStartX: number;
    dragStartY: number;
    cursorX: number;
    cursorY: number;
    canvas: HTMLCanvasElement;
    radius: number;
    lineWidth: number;
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

export interface RecordData {
    [fieldName: string]: string | number;
}
