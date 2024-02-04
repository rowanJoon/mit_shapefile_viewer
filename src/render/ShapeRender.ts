import {BoundingBox, Coordinate, GeoCanvasInteract} from "../../types";
import {ShapeRenderService} from "./ShapeRenderService";
import {Layer} from "./Layer";
import {QuadTree} from "../handler/QuadTree";
import {CommonPolyRecordContents, Shape,} from "../feature/Shape";

export class ShapeRender extends ShapeRenderService {
    private readonly shape: Shape;
    private readonly layer: Layer;
    private readonly quadtree: QuadTree;

    constructor(canvasId: string, shape: Shape, layer: Layer, quadtree: QuadTree) {
        super(canvasId);
        this.shape = shape;
        this.layer = layer;
        this.quadtree = quadtree;
    }

    public render(geoCanvasInteract: GeoCanvasInteract): void {
        const layer: Layer = this.layer;

        layer.addLayer(this.shape);
        this.checkInitRenderer();
        this._renderingCanvas(geoCanvasInteract);
    }

    private _renderingCanvas(
        geoCanvasInteract: GeoCanvasInteract
    ): void {
        const layer = this.layer;
        let extractCoordinate: Coordinate;
        let hasCleared: boolean = false;

        this.clearContext();
        this.saveContext();
        this.scaleContext(geoCanvasInteract.zoom, geoCanvasInteract.zoom);
        this.translateContext(geoCanvasInteract.panX, geoCanvasInteract.panY);

        for (let i = 0, len = layer.getLayersLength(); i < len; i++) {
            if (!hasCleared) {
                this.clearContext();
                hasCleared = true;
            }

            const boundingBox: BoundingBox = layer.getLayer()[i].shapeHeader.boundingBox;
            const polyShapeType: number = layer.getLayer()[i].shapeHeader.shapeType;
            const recordContents: Coordinate[] | CommonPolyRecordContents = layer.layerShape[i].shapeContents.recordContents;

            if (Array.isArray(recordContents)) {
                for (const coord of recordContents) {
                    extractCoordinate = this.extractCoordinates(coord, boundingBox);
                    this.renderer.drawPoint(extractCoordinate.x, extractCoordinate.y, geoCanvasInteract.radius);
                    this._setShapeStyleFromType(polyShapeType);

                    this.quadtree.insert(extractCoordinate);
                }
            } else {
                const partsCoordinates: Array<Coordinate>[] = recordContents.PartsCoordinates;
                this.renderer.setLineWidth(geoCanvasInteract.lineWidth);

                partsCoordinates.forEach(coordPair => {
                    this.renderer.beginPath();

                    Object.values(coordPair).forEach((coord: Coordinate, idx: number) => {
                        extractCoordinate = this.extractCoordinates(coord, boundingBox);
                        this.renderer.drawPoly(extractCoordinate.x, extractCoordinate.y, idx);
                    });

                    this.renderer.closePath();
                    this._setShapeStyleFromType(polyShapeType);

                    if (polyShapeType === 5) {
                        this.renderer.fill();
                    }

                    this.renderer.stroke();
                });
            }
        }
        // this.quadtree.show(geoCanvasInteract);
        console.log(this.quadtree);
        this.restoreContext();
    }

    private _setShapeStyleFromType(shapeType: number): void {
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