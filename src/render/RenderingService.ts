import { RenderingEngine } from './RenderingEngine.js';

export abstract class RenderingService {
    protected renderer: RenderingEngine;

    constructor(canvasId: string) {
        this.renderer = new RenderingEngine(canvasId);
    }

    abstract draw(): void;

    checkInitRenderer() {
        if (!this.renderer) {
            console.error('Renderer not initialized!');
            return;
        }
    }

    clearAndSaveContext() {
        this.renderer.clearCanvas();
        this.renderer.saveContext();
    }

    restoreContext() {
        this.renderer.restoreContext();
    }

    scaleContext(minZoom: number, maxZoom: number) {
        this.renderer.scale(minZoom, maxZoom);
    }

    translateContext(panX: number, panY: number) {
        this.renderer.translate(panX, panY);
    }
}
