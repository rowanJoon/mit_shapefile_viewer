import { GeoCanvasEventHandler } from './GeoCanvasEventHandler.js';

export class MouseMoveEventHandler extends GeoCanvasEventHandler {
    handleEvent(e: MouseEvent): void {
        if (this.interactor.isDragging) {
            const deltaX = e.clientX - this.interactor.dragStartX;
            const deltaY = e.clientY - this.interactor.dragStartY;

            this.interactor.panX = deltaX;
            this.interactor.panY = deltaY;

            this.geoData?.clearAndSaveContext();
            this.geoData?.scaleContext(this.interactor.zoom, this.interactor.zoom);
            this.geoData?.translateContext(this.interactor.panX, this.interactor.panY);
            this.geoData?.draw();
            this.geoData?.restoreContext();

            console.log('mouseMove: ', this.interactor);
        }
    }
}
