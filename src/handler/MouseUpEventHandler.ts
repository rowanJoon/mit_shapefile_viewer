import { GeoCanvasEventHandler } from './GeoCanvasEventHandler.js';

export class MouseUpEventHandler extends GeoCanvasEventHandler {
    handleEvent(e: MouseEvent): void {
        e.preventDefault();

        this.interactor.isDragging = false;

        console.log('mouseUp: ', this.interactor);
    }
}
