import { GeoCanvasEventHandler } from './GeoCanvasEventHandler.js';

export class MouseUpEventHandler extends GeoCanvasEventHandler {
    handleEvent(e: MouseEvent): void {
        e.preventDefault();

        this.shapeRender.render(this.geoCanvasInteract);
        this.geoCanvasInteract.isDragging = false;
    }
}
