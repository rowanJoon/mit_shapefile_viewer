import { Point } from '../feature/Point.js';
import { RenderingService } from './RenderingService.js';

export class RenderingPoint extends RenderingService {
    private point: Point;

    constructor(canvasId: string, point: Point) {
        super(canvasId);
        this.point = point;
    }

    draw(): void {
        this.checkInitRenderer();

        const boundingBox = this.point.shapeHeader.boundingBox;
        const coordinates = this.point.shapeContents.contents;

        this.clearAndSaveContext();

        if (Array.isArray(coordinates)) {
            for (const coord of coordinates) {
                const x: number = ((coord.x - boundingBox.xMin) / (boundingBox.xMax - boundingBox.xMin)) * this.renderer.canvas.width;
                const y: number = this.renderer.canvas.height - ((coord.y - boundingBox.yMin) / (boundingBox.yMax - boundingBox.yMin)) * this.renderer.canvas.height;

                this.renderer.drawPoint(x, y);
            }

            this.restoreContext();
        }
    }
}
