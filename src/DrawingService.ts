import { Coordinate } from './type/Type.js';

import { Point } from './feature/Point.js';
import { Poly } from './feature/Poly.js';

import { RenderingEngine } from './util/RenderingEngine.js';

abstract class DrawingService {
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
}

export class DrawingPoint extends DrawingService {
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

        this.restoreContext();
    }
}

export class DrawingPoly extends DrawingService {
    private poly: Poly;

    constructor(canvasId: string, poly: Poly) {
        super(canvasId);
        this.poly = poly;
    }

    draw(): void {
        this.checkInitRenderer();

        const shapeType: number = this.poly.shapeHeader.shapeType;
        const boundingBox = this.poly.shapeHeader.boundingBox;
        const contents = this.poly.shapeContents.contents;

        this.clearAndSaveContext();

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

        this.restoreContext();
    }
}
