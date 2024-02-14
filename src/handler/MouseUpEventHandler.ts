import { GeoCanvasEventHandler } from './GeoCanvasEventHandler';

export class MouseUpEventHandler extends GeoCanvasEventHandler {
    handleEvent(e: MouseEvent): void {
        e.preventDefault();

        this.geoCanvasInteract.isDragging = false;
        this.geoCanvasInteract.dragStartX = 0;
        this.geoCanvasInteract.dragStartY = 0;
    }
}
