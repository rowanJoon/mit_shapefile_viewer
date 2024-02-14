import { GeoCanvasEventHandler } from './GeoCanvasEventHandler';

export class MouseWheelEventHandler extends GeoCanvasEventHandler {
    handleEvent(e: WheelEvent): void {
        e.preventDefault();

        const zoomFactor: number = 0.01;
        const zoomDirection: number = e.deltaY > 0 ? -1 : 1;

        // this.geoCanvasInteract.mouseX = e.offsetX;
        // this.geoCanvasInteract.mouseY = e.offsetY;

        this.geoCanvasInteract.mouseX = e.clientX - this.geoCanvasInteract.canvas.getBoundingClientRect().left;
        this.geoCanvasInteract.mouseY = e.clientY - this.geoCanvasInteract.canvas.getBoundingClientRect().top;

        const currentZoom: number = this.geoCanvasInteract.zoom;
        const newZoom: number = Math.max(currentZoom + zoomDirection * zoomFactor, 0.1);

        this.geoCanvasInteract.zoom = newZoom;

        this.geoCanvasInteract.panX += (this.geoCanvasInteract.mouseX - this.geoCanvasInteract.canvas.width / 2) * (currentZoom - newZoom);
        this.geoCanvasInteract.panY += (this.geoCanvasInteract.mouseY - this.geoCanvasInteract.canvas.height / 2) * (currentZoom - newZoom);

        this.geoCanvasInteract.canvasX = (this.geoCanvasInteract.mouseX - this.geoCanvasInteract.panX) / this.geoCanvasInteract.zoom;
        this.geoCanvasInteract.canvasY = (this.geoCanvasInteract.mouseY - this.geoCanvasInteract.panY) / this.geoCanvasInteract.zoom;

        this.geoCanvasInteract.radius = 2.5 / newZoom;
        this.geoCanvasInteract.lineWidth = 1 / newZoom;

        this.shapeRender.render(this.geoCanvasInteract);
    }
}
