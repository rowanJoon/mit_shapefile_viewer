import { Interactor } from '../type/Type.js';
import { EventListener } from '../util/EventDelegator.js';
import { RenderingPoint } from '../render/RenderingPoint.js';
import { RenderingPoly } from '../render/RenderingPoly.js';

export abstract class GeoCanvasEventHandler implements EventListener {
    protected interactor: Interactor;
    protected geoData: RenderingPoint | RenderingPoly;

    constructor(interactor: Interactor, geoData: RenderingPoint | RenderingPoly) {
        this.interactor = interactor;
        this.geoData = geoData;
    }

    abstract handleEvent(e: Event): void;
}
