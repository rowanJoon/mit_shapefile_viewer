import { RenderingEngine } from './RenderingEngine.js';

export abstract class RenderingService {
    protected renderer: RenderingEngine;

    protected constructor(canvasId: string) {
        this.renderer = new RenderingEngine(canvasId);
    }

    abstract draw(): void;

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
}
