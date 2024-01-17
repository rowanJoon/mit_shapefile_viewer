import { GeoCanvasEventHandler } from './GeoCanvasEventHandler.js';

export class MouseWheelEventHandler extends GeoCanvasEventHandler {
    handleEvent(e: WheelEvent): void {
        e.preventDefault();

        const zoomFactor = 0.01;
        const zoomDirection = e.deltaY > 0 ? -1 : 1;

        const mouseX = e.offsetX;
        const mouseY = e.offsetY;

        const currentZoom = this.interactor.zoom;
        const newZoom = Math.max(currentZoom + zoomDirection * zoomFactor, 0.1);

        this.interactor.zoom = newZoom;

        this.interactor.panX += (mouseX - this.interactor.canvas.width / 2) * (currentZoom - newZoom);
        this.interactor.panY += (mouseY - this.interactor.canvas.height / 2) * (currentZoom - newZoom);

        this.geoData?.clearAndSaveContext();
        this.geoData?.scaleContext(this.interactor.zoom, this.interactor.zoom);
        this.geoData?.translateContext(this.interactor.panX, this.interactor.panY);
        this.geoData?.draw();
        this.geoData?.restoreContext();
    }
}
