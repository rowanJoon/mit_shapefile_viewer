import { CanvasRenderer } from './CanvasRenderer.js';

import { Coordinate } from '../type/Type.js';
import { Point } from '../feature/Point.js';
import { Poly } from '../feature/poly/Poly.js';

export class Draw {
    private static renderer: CanvasRenderer;

    static init(canvasId: string) {
        this.renderer = new CanvasRenderer(canvasId);
    }

    static drawPointWebPage(point: Point) {
        if (!this.renderer) {
            console.error('Renderer not initialized!');
            return;
        }

        const boundingBox = point.shapeHeader.boundingBox;
        const coordinates = point.shapeContents.contents;

        this.renderer.clearCanvas();
        this.renderer.saveContext();

        if (Array.isArray(coordinates)) {
            for (const coord of coordinates) {
                const x: number =
                    ((coord.x - boundingBox.xMin) /
                        (boundingBox.xMax - boundingBox.xMin)) *
                    this.renderer.canvas.width;
                const y: number =
                    this.renderer.canvas.height -
                    ((coord.y - boundingBox.yMin) /
                        (boundingBox.yMax - boundingBox.yMin)) *
                        this.renderer.canvas.height;

                this.renderer.drawPoint(x, y);
            }
        }

        this.renderer.restoreContext();
    }

    static drawPolyWebPage(poly: Poly) {
        if (!this.renderer) {
            console.error('Renderer not initialized!');
            return;
        }

        const shapeType: number = poly.shapeHeader.shapeType;
        const boundingBox = poly.shapeHeader.boundingBox;
        const contents = poly.shapeContents.contents;

        this.renderer.clearCanvas();
        this.renderer.saveContext();

        if ('PartsCoordinates' in contents) {
            const partsCoordinates: Array<Coordinate>[] =
                contents.PartsCoordinates;

            partsCoordinates.forEach(coordPair => {
                this.renderer.beginPath();

                Object.values(coordPair).forEach((coord, idx) => {
                    const x: number =
                        ((coord.x - boundingBox.xMin) /
                            (boundingBox.xMax - boundingBox.xMin)) *
                        this.renderer.canvas.width;
                    const y: number =
                        this.renderer.canvas.height -
                        ((coord.y - boundingBox.yMin) /
                            (boundingBox.yMax - boundingBox.yMin)) *
                            this.renderer.canvas.height;

                    this.renderer.drawPoly(x, y, idx);
                });

                if (shapeType === 5) {
                    this.renderer.fill();
                    this.renderer.fillColor('green');
                }

                this.renderer.stroke();
            });
        }

        this.renderer.restoreContext();
    }
}
