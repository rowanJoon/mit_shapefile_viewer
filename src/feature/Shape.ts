import {Coordinate, BoundingBox} from "../../types";

export interface ShapeHeader {
    fileCode: number;
    fileLength: number;
    version: number;
    shapeType: number;
    boundingBox: BoundingBox;
}

export interface ShapeRecordContents {
    recordContents: Coordinate[] | CommonPolyRecordContents,
    canvasCoordinates: Coordinate[] | Array<Coordinate>[]
}

export interface CommonPolyRecordContents {
    Box: BoundingBox;
    NumParts: number;
    NumPoints: number;
    Parts: number[];
    PartsCoordinates: Array<Coordinate>[];
}

export class Shape {
    shapeHeader: ShapeHeader;
    shapeContents: ShapeRecordContents;

    constructor(shapeHeader: ShapeHeader, ShapeRecordContents: ShapeRecordContents) {
        this.shapeHeader = shapeHeader;
        this.shapeContents = ShapeRecordContents;
    }
}
