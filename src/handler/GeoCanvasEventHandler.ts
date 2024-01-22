import {GeoCanvasInteract} from '../type/Type.js';
import { EventListener } from '../util/EventDelegator.js';
import { RenderingPoint } from '../render/RenderingPoint.js';
import { RenderingPoly } from '../render/RenderingPoly.js';

export abstract class GeoCanvasEventHandler implements EventListener {
    protected geoCanvasInteract: GeoCanvasInteract;
    protected geoData: RenderingPoint | RenderingPoly;

    constructor(geoCanvasInteract: GeoCanvasInteract, geoData: RenderingPoint | RenderingPoly) {
        this.geoCanvasInteract = geoCanvasInteract;
        this.geoData = geoData;
    }

    abstract handleEvent(e: Event): void;
}
