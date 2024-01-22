import { GeoCanvasEventHandler } from './GeoCanvasEventHandler.js';

export class MouseUpEventHandler extends GeoCanvasEventHandler {
    handleEvent(e: MouseEvent): void {
        e.preventDefault();

        this.geoCanvasInteract.isDragging = false;
    }
}
