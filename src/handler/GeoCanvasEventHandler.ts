import {BoundingBox, GeoCanvasInteract} from '../type/Type.js';
import {EventListener} from '../util/EventDelegator.js';
import {ShapeRender} from "../render/ShapeRender";

export abstract class GeoCanvasEventHandler implements EventListener {
    shapeRender: ShapeRender;
    boundingBox: BoundingBox;
    geoCanvasInteract: GeoCanvasInteract;

    constructor(shapeRender: ShapeRender, boundingBox: BoundingBox, geoCanvasInteract: GeoCanvasInteract) {
        this.shapeRender = shapeRender;
        this.boundingBox = boundingBox;
        this.geoCanvasInteract = geoCanvasInteract;
    }

    abstract handleEvent(e: Event): void;
}
