import { GeoCanvasInteract } from '../type/Type.js';
import { EventListener } from '../util/EventDelegator.js';
import { ShapeRender } from "../render/ShapeRender";

export abstract class GeoCanvasEventHandler implements EventListener {
    protected shapeRender: ShapeRender;
    protected geoCanvasInteract: GeoCanvasInteract;

    constructor(shapeRender: ShapeRender, geoCanvasInteract: GeoCanvasInteract) {
        this.shapeRender = shapeRender;
        this.geoCanvasInteract = geoCanvasInteract;
    }

    abstract handleEvent(e: Event): void;
}
