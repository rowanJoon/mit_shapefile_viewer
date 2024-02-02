import { Shape, ShapeHeader, ShapeContents } from '../../types';

export class Poly implements Shape {
    shapeHeader: ShapeHeader;
    shapeContents: ShapeContents;

    constructor(shapeHeader: ShapeHeader, shapeContents: ShapeContents) {
        this.shapeHeader = shapeHeader;
        this.shapeContents = shapeContents;
    }
}
