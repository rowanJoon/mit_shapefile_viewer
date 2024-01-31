import { BoundingBox, Coordinate, GeoCanvasInteract, PolyDataSet, Shape } from "../type/Type.js";
import { ShapeRenderService } from "./ShapeRenderService.js";
import { Layer } from "./Layer.js";

export class ShapeRender extends ShapeRenderService {
    private readonly shape: Shape;
    private readonly layer: Layer;
    constructor(canvasId: string, shape: Shape, layer: Layer) {
        super(canvasId);
        this.shape = shape;
        this.layer = layer;
    }

    public render(geoCanvasInteract: GeoCanvasInteract): void {
        this.layer.addGeoObject(this.shape);
        this.checkInitRenderer();
        this.renderingCanvas(geoCanvasInteract);

        console.log(this.layer);
    }

    private renderingCanvas(
        geoCanvasInteract: GeoCanvasInteract
    ): void {
        const pageCoordinates = [];
        let extractCoord: Coordinate;
        let hasCleared: boolean = false;

        this.clearContext();
        this.saveContext();
        this.scaleContext(geoCanvasInteract.zoom, geoCanvasInteract.zoom);
        this.translateContext(geoCanvasInteract.panX, geoCanvasInteract.panY);

        for (let i = 0, len = this.layer.sizeGeoObject(); i < len; i++) {
            if (!hasCleared) {
                this.clearContext();
                hasCleared = true;
            }

            const contents: Coordinate[] | PolyDataSet = this.layer.geoObjects[i].shapeContents.contents;
            const boundingBox: BoundingBox = this.shape.shapeHeader.boundingBox;
            const polyShapeType: number = this.layer.getGeoObject()[i].shapeHeader.shapeType;

            if (Array.isArray(contents)) {
                for (const coord of contents) {
                    extractCoord = this.extractCoordinates(coord, boundingBox);
                    this.renderer.drawPoint(extractCoord.x, extractCoord.y, geoCanvasInteract.radius);
                    this.setShapeStyleFromType(polyShapeType);
                    pageCoordinates.push(extractCoord);
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

                    this.setShapeStyleFromType(polyShapeType);

                    if (polyShapeType === 5) {
                        this.renderer.fill();
                    }

                    this.renderer.stroke();
                });
            }
        }

        this.restoreContext();
        console.log(pageCoordinates);
    }

    private setShapeStyleFromType(shapeType: number) {
        switch (shapeType) {
            case 1:
                this.renderer.fillColor('#339933');
                break;
            case 3:
                this.renderer.strokeColor('#6666CC');
                break;
            case 5:
                this.renderer.strokeColor('#996633');
                this.renderer.fillColor('#FFCC00');
        }
    }
}