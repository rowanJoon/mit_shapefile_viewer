import {BoundingBox, Coordinate, GeoCanvasInteract} from "../../types";
import {Layer} from "./Layer";
import {CommonPolyRecordContents, Shape} from "../feature/Shape";
import {ShapeRenderEngine} from "./ShapeRenderEngine";
import {EventDelegator} from "../util/EventDelegator";
import {MouseClickEventHandler} from "../handler/MouseClickEventHandler";
import {MouseMoveEventHandler} from "../handler/MouseMoveEventHandler";
import {MouseDownEventHandler} from "../handler/MouseDownEventHandler";
import {MouseUpEventHandler} from "../handler/MouseUpEventHandler";
import {MouseWheelEventHandler} from "../handler/MouseWheelEventHandler";
import {Calculator} from "../util/Calculator";

export class ShapeRender extends ShapeRenderEngine {
    private readonly shape: Shape;
    private readonly layer: Layer;
    private eventDelegator: EventDelegator;
    public calculator: Calculator;

    constructor(canvasId: string, shape: Shape, layer: Layer, eventDelegator: EventDelegator) {
        super(canvasId);
        this.shape = shape;
        this.layer = layer;
        this.eventDelegator = eventDelegator;
        this.calculator = new Calculator();
    }

    public render(geoCanvasInteract: GeoCanvasInteract): void {
        const layer: Layer = this.layer;
        layer.addLayer(this.shape);

        const boundingBox: BoundingBox = this.calculator.calculateLargestBoundingBox(layer);

        this._extractCanvasCoordinates(geoCanvasInteract, layer, boundingBox);
        this._renderingCanvas(geoCanvasInteract, layer);
        this.setMouseEvent(geoCanvasInteract, boundingBox);
    }

    private _extractCanvasCoordinates(geoCanvasInteract: GeoCanvasInteract, layer: Layer, boundingBox: BoundingBox) {
        for (let i = 0; i < layer.getLayer().length; i++) {
            const recordContents: Coordinate[] | CommonPolyRecordContents = layer.layerShape[i].shapeContents.recordContents;

            if (Array.isArray(recordContents)) {
                const canvasCoordinateArr: Coordinate[] = [];

                for (let j = 0; j < recordContents.length; j++) {
                    const realCoordinate: Coordinate = recordContents[j];
                    const canvasCoordinate: Coordinate = this.calculator.calculateRealCoordToCanvasCoord(this.canvas, realCoordinate, boundingBox);
                    const x: number = canvasCoordinate.x * geoCanvasInteract.zoom + geoCanvasInteract.panX;
                    const y: number = canvasCoordinate.y * geoCanvasInteract.zoom + geoCanvasInteract.panY;

                    canvasCoordinate.x = x;
                    canvasCoordinate.y = y;
                    canvasCoordinateArr.push({x, y});
                }
                layer.layerShape[i].shapeContents.canvasCoordinates = canvasCoordinateArr;
            } else {
                const partsCoordinates: Array<Coordinate>[] = recordContents.PartsCoordinates;

                partsCoordinates.forEach((coordinatesPair: Coordinate[], pairIdx: number) => {
                    let canvasCoordinateArr: Coordinate[] = [];

                    Object.values(coordinatesPair).forEach(realCoordinate => {
                        const canvasCoordinate: Coordinate = this.calculator.calculateRealCoordToCanvasCoord(this.canvas, realCoordinate, boundingBox);
                        const x: number = canvasCoordinate.x * geoCanvasInteract.zoom + geoCanvasInteract.panX;
                        const y: number = canvasCoordinate.y * geoCanvasInteract.zoom + geoCanvasInteract.panY;

                        canvasCoordinate.x = x;
                        canvasCoordinate.y = y;
                        canvasCoordinateArr.push(canvasCoordinate);
                    });

                    layer.layerShape[i].shapeContents.canvasCoordinates[pairIdx] = canvasCoordinateArr;
                });
            }
        }
    }

    private _renderingCanvas(geoCanvasInteract: GeoCanvasInteract, layer: Layer): void {
        let hasCleared: boolean = false;

        this.setClearRect();
        this.setSave();
        this.setScale(geoCanvasInteract.zoom, geoCanvasInteract.zoom);
        this.setTranslate(geoCanvasInteract.panX, geoCanvasInteract.panY);

        for (let i = 0; i < layer.getLayer().length; i++) {
            if (!hasCleared) {
                this.setClearRect();
                hasCleared = true;
            }

            const canvasCoordinates: Coordinate[] | Coordinate[][] = layer.getLayer()[i].shapeContents.canvasCoordinates;
            const shapeType: number = layer.getLayer()[i].shapeHeader.shapeType;

            switch (shapeType) {
                case 1:
                    const coordinatesForPoint: Coordinate[] = canvasCoordinates as Coordinate[];
                    for (let i = 0; i < coordinatesForPoint.length; i++) {
                        this.renderingPoint(coordinatesForPoint[i].x, coordinatesForPoint[i].y, geoCanvasInteract.radius, '#339933');
                    }
                    break;
                case 3:
                    const coordinatesForPolyline: Coordinate[][] = canvasCoordinates as Coordinate[][];
                    for (let i = 0; i < coordinatesForPolyline.length; i++) {
                        coordinatesForPolyline[i].forEach((coordinate, idx) => {
                            this.renderingPolyline(coordinate.x, coordinate.y, idx, geoCanvasInteract.lineWidth, '#6666CC');
                        });
                    }
                    break;
                case 5:
                    const coordinatesForPolygon: Coordinate[][] = canvasCoordinates as Coordinate[][];
                    for (let i = 0; i < coordinatesForPolygon.length; i++) {
                        coordinatesForPolygon[i].forEach((coordinate, idx) => {
                            this.renderingPolygon(coordinate.x, coordinate.y, idx, coordinatesForPolygon[i].length, '#996633', '#FFCC00');
                        });
                    }
                    break;
            }
        }

        this.setRestore();
    }

    public renderingPoint(x: number, y: number, radius: number, fillColor: string): void {
        this.setFillColor(fillColor);
        this.setBeginPath();
        this.setArc(x, y, radius, 0, 2 * Math.PI);
        this.setFill();
        this.setClosePath();
    }

    public renderingPolyline(x: number, y: number, coordinatesArrIdx: number, lineWidth: number, strokeColor: string): void {
        this.setStrokeColor(strokeColor);
        this.setLineWidth(lineWidth);

        if (coordinatesArrIdx === 0) {
            this.setBeginPath();
            this.setMoveTo(x, y);
        } else {
            this.setLineTo(x, y);
            this.setClosePath();
            this.setStroke();
        }
    }

    public renderingPolygon(x: number, y: number, coordinatesArrIdx: number, coordinatesArrLength: number, strokeColor: string, fillColor: string): void {
        this.setStrokeColor(strokeColor);
        this.setFillColor(fillColor);

        if (coordinatesArrIdx === 0) {
            this.setBeginPath();
            this.setMoveTo(x, y);
        } else {
            this.setLineTo(x, y);
        }

        if (coordinatesArrIdx === coordinatesArrLength - 1) {
            this.setClosePath();
            this.setStroke();
            this.setFill();
        }
    }

    public setMouseEvent(geoCanvasInteract: GeoCanvasInteract, boundingBox: BoundingBox): void {
        if (this.eventDelegator.eventListeners.size !== 0) {
            this.eventDelegator.removeAllEventListeners();
        }

        this._addMouseEventHandler(geoCanvasInteract, boundingBox);
    }

    private _addMouseEventHandler(geoCanvasInteract: GeoCanvasInteract, boundingBox: BoundingBox): void {
        if (this !== undefined) {
            const shapeRender: ShapeRender = this;
            const layer: Layer = this.layer;

            const mouseClickEventHandler: MouseClickEventHandler = new MouseClickEventHandler(shapeRender, boundingBox, geoCanvasInteract, layer);
            const mouseDownEventHandler: MouseMoveEventHandler = new MouseDownEventHandler(shapeRender, boundingBox, geoCanvasInteract, layer);
            const mouseMoveEventHandler: MouseMoveEventHandler = new MouseMoveEventHandler(shapeRender, boundingBox, geoCanvasInteract, layer);
            const mouseUpEventHandler: MouseMoveEventHandler = new MouseUpEventHandler(shapeRender, boundingBox, geoCanvasInteract, layer);
            const mouseWheelEventHandler: MouseMoveEventHandler = new MouseWheelEventHandler(shapeRender, boundingBox, geoCanvasInteract, layer);

            this.eventDelegator.addEventListener('click', mouseClickEventHandler);
            this.eventDelegator.addEventListener('mousedown', mouseDownEventHandler);
            this.eventDelegator.addEventListener('mousemove', mouseMoveEventHandler);
            this.eventDelegator.addEventListener('mouseup', mouseUpEventHandler);
            this.eventDelegator.addEventListener('wheel', mouseWheelEventHandler);
        }
    }
}