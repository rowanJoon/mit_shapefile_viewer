import { ShapeRenderEngine } from './ShapeRenderEngine.js';
import { BoundingBox, Coordinate } from "../type/Type";

export abstract class ShapeRenderService {
    protected renderer: ShapeRenderEngine;

    protected constructor(canvasId: string) {
        this.renderer = new ShapeRenderEngine(canvasId);
    }

    checkInitRenderer(): void {
        if (!this.renderer) {
            console.error('Renderer not initialized!');
            return;
        }
    }

    clearAndSaveContext(): void {
        this.renderer.clearCanvas();
        this.renderer.saveContext();
    }

    restoreContext(): void {
        this.renderer.restoreContext();
    }

    scaleContext(minZoom: number, maxZoom: number): void {
        this.renderer.scale(minZoom, maxZoom);
    }

    translateContext(panX: number, panY: number): void {
        this.renderer.translate(panX, panY);
    }

    extractCoordinates(coordinate: Coordinate, boundingBox: BoundingBox): Coordinate {
        const x: number = ((coordinate.x - boundingBox.xMin) / (boundingBox.xMax - boundingBox.xMin)) * this.renderer.canvas.width;
        const y: number = this.renderer.canvas.height - ((coordinate.y - boundingBox.yMin) / (boundingBox.yMax - boundingBox.yMin)) * this.renderer.canvas.height;

        return { x, y }
    }
}
