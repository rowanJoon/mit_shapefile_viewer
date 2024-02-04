import {BoundingBox, GeoCanvasInteract} from '../../types';
import {EventListener} from '../util/EventDelegator';
import {ShapeRender} from "../render/ShapeRender";
import {Layer} from "../render/Layer";
import {QuadTree} from "./QuadTree";

export abstract class GeoCanvasEventHandler implements EventListener {
    shapeRender: ShapeRender;
    boundingBox: BoundingBox;
    geoCanvasInteract: GeoCanvasInteract;
    layer: Layer;
    quadtree: QuadTree;

    constructor(shapeRender: ShapeRender, boundingBox: BoundingBox, geoCanvasInteract: GeoCanvasInteract, layer: Layer, quadtree: QuadTree) {
        this.shapeRender = shapeRender;
        this.boundingBox = boundingBox;
        this.geoCanvasInteract = geoCanvasInteract;
        this.layer = layer;
        this.quadtree = quadtree;
    }

    abstract handleEvent(e: Event): void;
}
