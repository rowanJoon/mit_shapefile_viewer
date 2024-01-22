import { GeoCanvasInteract } from '../type/Type.js';
import { EventListener } from '../util/EventDelegator.js';
import { ShapeRender } from "../render/ShapeRender";

export abstract class GeoCanvasEventHandler implements EventListener {
    protected geoCanvasInteract: GeoCanvasInteract;
    protected shapeRender: ShapeRender;

    constructor(geoCanvasInteract: GeoCanvasInteract, shapeRender: ShapeRender) {
        this.geoCanvasInteract = geoCanvasInteract;
        this.shapeRender = shapeRender;
    }

    abstract handleEvent(e: Event): void;
}
