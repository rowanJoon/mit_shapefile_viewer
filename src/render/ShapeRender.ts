import {BoundingBox, Coordinate, GeoCanvasInteract} from "../../types";
import {Layer} from "./Layer";
import {CommonPolyRecordContents, Shape,} from "../feature/Shape";
import {ShapeRenderEngine} from "./ShapeRenderEngine";

export class ShapeRender extends ShapeRenderEngine {
    private readonly shape: Shape;
    private readonly layer: Layer;

    constructor(canvasId: string, shape: Shape, layer: Layer) {
        super(canvasId);
        this.shape = shape;
        this.layer = layer;
    }

    public render(geoCanvasInteract: GeoCanvasInteract): void {
        const layer: Layer = this.layer;
        layer.addLayer(this.shape);
        this._renderingCanvas(geoCanvasInteract);
    }

    private _renderingCanvas(
        geoCanvasInteract: GeoCanvasInteract
    ): void {
        const layer: Layer = this.layer;
        let extractCoordinate: Coordinate;
        let hasCleared: boolean = false;

        this.clearRect();
        this.save();
        this.scale(geoCanvasInteract.zoom, geoCanvasInteract.zoom);
        this.translate(geoCanvasInteract.panX, geoCanvasInteract.panY);

        const boundingBox: BoundingBox = this._calculateLargestBoundingBox(layer);

        for (let i = 0, len = layer.getLayersLength(); i < len; i++) {
            if (!hasCleared) {
                this.clearRect();
                hasCleared = true;
            }

            const polyShapeType: number = layer.getLayer()[i].shapeHeader.shapeType;
            const recordContents: Coordinate[] | CommonPolyRecordContents = layer.layerShape[i].shapeContents.recordContents;

            if (Array.isArray(recordContents)) {
                for (let j = 0; j < recordContents.length; j++) {
                    extractCoordinate = this.convertRealCoordToCanvasCoord(recordContents[j], boundingBox);
                    this.drawPoint(extractCoordinate.x, extractCoordinate.y, geoCanvasInteract.radius);
                    this._setShapeStyleFromType(polyShapeType);
                }
            } else {
                const partsCoordinates: Array<Coordinate>[] = recordContents.PartsCoordinates;
                this.setLineWidth(geoCanvasInteract.lineWidth);

                partsCoordinates.forEach(coordPair => {
                    this.beginPath();

                    Object.values(coordPair).forEach((coord: Coordinate, idx: number) => {
                        extractCoordinate = this.convertRealCoordToCanvasCoord(coord, boundingBox);
                        this.drawPoly(extractCoordinate.x, extractCoordinate.y, idx);
                    });

                    this.closePath();
                    this._setShapeStyleFromType(polyShapeType);

                    if (polyShapeType === 5) {
                        this.fill();
                    }

                    this.stroke();
                });
            }
        }

        this.restore();
    }

    private _calculateLargestBoundingBox(layer: Layer): BoundingBox {
        let largestBoundingBox: BoundingBox | null = null;

        for (let i = 0; i < layer.getLayer().length; i++) {
            const boundingBox: BoundingBox = layer.getLayer()[i].shapeHeader.boundingBox;

            if (largestBoundingBox === null) {
                largestBoundingBox = boundingBox;
            } else {
                largestBoundingBox = {
                    xMin: Math.min(largestBoundingBox.xMin, boundingBox.xMin),
                    yMin: Math.min(largestBoundingBox.yMin, boundingBox.yMin),
                    xMax: Math.max(largestBoundingBox.xMax, boundingBox.xMax),
                    yMax: Math.max(largestBoundingBox.yMax, boundingBox.yMax)
                };
            }
        }

        if (largestBoundingBox === null) {
            return { xMin: 0, yMin: 0, xMax: 0, yMax: 0 };
        }

        return largestBoundingBox;
    }

    private _setShapeStyleFromType(shapeType: number): void {
        switch (shapeType) {
            case 1:
                this.fillColor('#339933');
                break;
            case 3:
                this.strokeColor('#6666CC');
                break;
            case 5:
                this.strokeColor('#996633');
                this.fillColor('#FFCC00');
        }
    }
}