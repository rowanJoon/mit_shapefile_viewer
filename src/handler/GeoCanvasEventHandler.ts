import {BoundingBox, GeoCanvasInteract} from '../../types';
import {EventListener} from '../util/EventDelegator';
import {ShapeRender} from "../render/ShapeRender";
import {Layer} from "../render/Layer";

export abstract class GeoCanvasEventHandler implements EventListener {
    shapeRender: ShapeRender;
    boundingBox: BoundingBox;
    geoCanvasInteract: GeoCanvasInteract;
    layer: Layer;

    constructor(shapeRender: ShapeRender, boundingBox: BoundingBox, geoCanvasInteract: GeoCanvasInteract, layer: Layer) {
        this.shapeRender = shapeRender;
        this.boundingBox = boundingBox;
        this.geoCanvasInteract = geoCanvasInteract;
        this.layer = layer;
    }

    abstract handleEvent(e: Event): void;
}
