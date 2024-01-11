import { ShapeHeader, ShapeContents } from '../../type/Type.js';
import { Poly } from '../Poly.js';

export class Polyline implements Poly {
    shapeHeader: ShapeHeader;
    shapeContents: ShapeContents;

    constructor(shapeHeader: ShapeHeader, shapeContents: ShapeContents) {
        this.shapeHeader = shapeHeader;
        this.shapeContents = shapeContents;
    }
}
