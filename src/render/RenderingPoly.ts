import {BoundingBox, Coordinate, PolyDataSet} from '../type/Type.js';
import { Poly } from '../feature/Poly.js';
import { RenderingService } from './RenderingService.js';

export class RenderingPoly extends RenderingService {
    private poly: Poly;

    constructor(canvasId: string, poly: Poly) {
        super(canvasId);
        this.poly = poly;
    }

    draw(): void {
        this.checkInitRenderer();

        const shapeType: number = this.poly.shapeHeader.shapeType;
        const boundingBox: BoundingBox = this.poly.shapeHeader.boundingBox;
        const contents: Coordinate[] | PolyDataSet = this.poly.shapeContents.contents;

        this.clearAndSaveContext();

        if ('PartsCoordinates' in contents) {
            const partsCoordinates: Array<Coordinate>[] = contents.PartsCoordinates;

            partsCoordinates.forEach(coordPair => {
                this.renderer.beginPath();

                Object.values(coordPair).forEach((coord, idx) => {
                    const x: number = ((coord.x - boundingBox.xMin) / (boundingBox.xMax - boundingBox.xMin)) * this.renderer.canvas.width;
                    const y: number = this.renderer.canvas.height - ((coord.y - boundingBox.yMin) / (boundingBox.yMax - boundingBox.yMin)) * this.renderer.canvas.height;

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
