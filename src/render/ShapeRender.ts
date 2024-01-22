import { BoundingBox, Coordinate, PolyDataSet, Shape } from "../type/Type.js";
import { ShapeRenderService } from "./ShapeRenderService.js";

export class ShapeRender extends ShapeRenderService {
    private shape: Shape;

    constructor(canvasId: string, shape: Shape) {
        super(canvasId);
        this.shape = shape;
    }

    render(): void {
        const shapeType = this.shape.shapeHeader.shapeType;
        const boundingBox: BoundingBox = this.shape.shapeHeader.boundingBox;
        const contents: Coordinate[] | PolyDataSet = this.shape.shapeContents.contents;

        this.checkInitRenderer();
        this.clearAndSaveContext();

        this.renderingCanvas(shapeType, contents, boundingBox);
    }

    renderingCanvas(shapeType: number, contents: Coordinate[] | PolyDataSet, boundingBox: BoundingBox): void {
        let extractCoord: Coordinate;

        if (Array.isArray(contents)) {
            for (const coord of contents) {
                extractCoord = this.extractCoordinates(coord, boundingBox);
                this.renderer.drawPoint(extractCoord.x, extractCoord.y);
            }

            this.restoreContext();
        } else {
            const partsCoordinates: Array<Coordinate>[] = contents.PartsCoordinates;

            partsCoordinates.forEach(coordPair => {
               this.renderer.beginPath();

               Object.values(coordPair).forEach((coord: Coordinate, idx: number) => {
                  extractCoord = this.extractCoordinates(coord, boundingBox);
                  this.renderer.drawPoly(extractCoord.x, extractCoord.y, idx);
               });

               if (shapeType === 5) {
                   this.renderer.fill();
                   this.renderer.fillColor('green');
               }

               this.renderer.stroke();
            });

            this.restoreContext();
        }
    }
}