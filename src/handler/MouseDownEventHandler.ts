import { GeoCanvasEventHandler } from './GeoCanvasEventHandler.js';

export class MouseDownEventHandler extends GeoCanvasEventHandler {
    handleEvent(e: MouseEvent): void {
        e.preventDefault();

        this.interactor.isDragging = true;
        this.interactor.dragStartX = e.clientX - this.interactor.panX;
        this.interactor.dragStartY = e.clientY - this.interactor.panY;

        console.log('mouseDown: ', this.interactor);
    }
}
