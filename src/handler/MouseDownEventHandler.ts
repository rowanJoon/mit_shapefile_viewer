import { GeoCanvasEventHandler } from './GeoCanvasEventHandler';

export class MouseDownEventHandler extends GeoCanvasEventHandler {
    handleEvent(e: MouseEvent): void {
        e.preventDefault();

        this.geoCanvasInteract.isDragging = true;
        this.geoCanvasInteract.dragStartX = e.clientX - this.geoCanvasInteract.panX;
        this.geoCanvasInteract.dragStartY = e.clientY - this.geoCanvasInteract.panY;
    }
}
