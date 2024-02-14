import { GeoCanvasEventHandler } from './GeoCanvasEventHandler';

export class MouseMoveEventHandler extends GeoCanvasEventHandler {
    handleEvent(e: MouseEvent): void {
        if (this.geoCanvasInteract.isDragging) {
            this.geoCanvasInteract.panX = e.clientX - this.geoCanvasInteract.dragStartX;
            this.geoCanvasInteract.panY = e.clientY - this.geoCanvasInteract.dragStartY;

            this.shapeRender.render(this.geoCanvasInteract);
        }
    }
}
