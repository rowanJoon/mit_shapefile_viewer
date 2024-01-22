import { GeoCanvasEventHandler } from './GeoCanvasEventHandler.js';

export class MouseWheelEventHandler extends GeoCanvasEventHandler {
    handleEvent(e: WheelEvent): void {
        e.preventDefault();

        const zoomFactor: number = 0.01;
        const zoomDirection: number = e.deltaY > 0 ? -1 : 1;

        const mouseX: number = e.offsetX;
        const mouseY: number = e.offsetY;

        const currentZoom: number = this.geoCanvasInteract.zoom;
        const newZoom: number = Math.max(currentZoom + zoomDirection * zoomFactor, 0.1);

        this.geoCanvasInteract.zoom = newZoom;

        this.geoCanvasInteract.panX += (mouseX - this.geoCanvasInteract.canvas.width / 2) * (currentZoom - newZoom);
        this.geoCanvasInteract.panY += (mouseY - this.geoCanvasInteract.canvas.height / 2) * (currentZoom - newZoom);

        this.shapeRender?.clearAndSaveContext();
        this.shapeRender?.scaleContext(this.geoCanvasInteract.zoom, this.geoCanvasInteract.zoom);
        this.shapeRender?.translateContext(this.geoCanvasInteract.panX, this.geoCanvasInteract.panY);
        this.shapeRender?.render();
        this.shapeRender?.restoreContext();
    }
}
