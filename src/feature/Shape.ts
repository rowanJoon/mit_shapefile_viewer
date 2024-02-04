import {Coordinate, BoundingBox} from "../../types";

interface ShapeHeader {
    fileCode: number;
    fileLength: number;
    version: number;
    shapeType: number;
    boundingBox: BoundingBox;
}

export interface PolyDataSet {
    Box: BoundingBox;
    NumParts: number;
    NumPoints: number;
    Parts: number[];
    PartsCoordinates: Array<Coordinate>[];
};

export interface ShapeContents {
    contents: Coordinate[] | PolyDataSet;
}

export class Shape {
    shapeHeader: ShapeHeader;
    shapeContents: ShapeContents;

    constructor(shapeHeader: ShapeHeader, shapeContents: ShapeContents) {
        this.shapeHeader = shapeHeader;
        this.shapeContents = shapeContents;
    }
}
