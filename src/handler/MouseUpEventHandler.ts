import { GeoCanvasEventHandler } from './GeoCanvasEventHandler';

export class MouseUpEventHandler extends GeoCanvasEventHandler {
    handleEvent(e: MouseEvent): void {
        e.preventDefault();

        this.geoCanvasInteract.isDragging = false;
    }
}
