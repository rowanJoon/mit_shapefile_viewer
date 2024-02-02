import { ShapeRenderEngine } from './ShapeRenderEngine';
import { BoundingBox, Coordinate } from "../../types";

export abstract class ShapeRenderService {
    protected renderer: ShapeRenderEngine;

    protected constructor(canvasId: string) {
        this.renderer = new ShapeRenderEngine(canvasId);
    }

    public checkInitRenderer(): void {
        if (!this.renderer) {
            console.error('Renderer not initialized!');
            return;
        }
    }

    public clearContext(): void {
        this.renderer.clearRect();
    }

    public saveContext(): void {
        this.renderer.save();
    }

    public restoreContext(): void {
        this.renderer.restore();
    }

    public scaleContext(minZoom: number, maxZoom: number): void {
        this.renderer.scale(minZoom, maxZoom);
    }

    public translateContext(panX: number, panY: number): void {
        this.renderer.translate(panX, panY);
    }

    public extractCoordinates(coordinate: Coordinate, boundingBox: BoundingBox): Coordinate {
        const x: number = ((coordinate.x - boundingBox.xMin) / (boundingBox.xMax - boundingBox.xMin)) * this.renderer.canvas.width;
        const y: number = this.renderer.canvas.height - ((coordinate.y - boundingBox.yMin) / (boundingBox.yMax - boundingBox.yMin)) * this.renderer.canvas.height;

        return { x, y }
    }
}
