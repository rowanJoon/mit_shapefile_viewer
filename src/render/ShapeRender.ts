import {BoundingBox, Coordinate, GeoCanvasInteract, PolyDataSet, Shape} from "../type/Type.js";
import { ShapeRenderService } from "./ShapeRenderService.js";

export class ShapeRender extends ShapeRenderService {
    private readonly shape: Shape;

    constructor(canvasId: string, shape: Shape) {
        super(canvasId);
        this.shape = shape;
    }

    render(geoCanvasInteract: GeoCanvasInteract): void {
        const shapeType: number = this.shape.shapeHeader.shapeType;
        const boundingBox: BoundingBox = this.shape.shapeHeader.boundingBox;
        const contents: Coordinate[] | PolyDataSet = this.shape.shapeContents.contents;

        this.checkInitRenderer();
        this.renderingCanvas(shapeType, contents, boundingBox, geoCanvasInteract);
    }

    renderingCanvas(
        shapeType: number,
        contents: Coordinate[] | PolyDataSet,
        boundingBox: BoundingBox,
        geoCanvasInteract: GeoCanvasInteract): void {
        let extractCoord: Coordinate;

        this.clearContext();
        this.saveContext();
        this.scaleContext(geoCanvasInteract.zoom, geoCanvasInteract.zoom);
        this.translateContext(geoCanvasInteract.panX, geoCanvasInteract.panY);

        if (Array.isArray(contents)) {
            for (const coord of contents) {
                extractCoord = this.extractCoordinates(coord, boundingBox);
                this.renderer.drawPoint(extractCoord.x, extractCoord.y, geoCanvasInteract.radius);
            }
        } else {
            const partsCoordinates: Array<Coordinate>[] = contents.PartsCoordinates;
            this.renderer.setLineWidth(geoCanvasInteract.lineWidth);

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
        }

        this.restoreContext();
    }
}