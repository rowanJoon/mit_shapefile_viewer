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

        this._renderingCanvas(geoCanvasInteract, layer, boundingBox);
        this.setMouseEvent(geoCanvasInteract, boundingBox);
    }

    private _renderingCanvas(geoCanvasInteract: GeoCanvasInteract, layer: Layer, boundingBox: BoundingBox): void {
        let hasCleared: boolean = false;

        this.clearRect();
        this.save();
        this.scale(geoCanvasInteract.zoom, geoCanvasInteract.zoom);
        this.translate(geoCanvasInteract.panX, geoCanvasInteract.panY);

        for (let i = 0; i < layer.getLayer().length; i++) {
            if (!hasCleared) {
                this.clearRect();
                hasCleared = true;
            }

            const shapeType: number = layer.getLayer()[i].shapeHeader.shapeType;
            const recordContents: Coordinate[] | CommonPolyRecordContents = layer.layerShape[i].shapeContents.recordContents;

            if (Array.isArray(recordContents)) {
                this._setStyleFromShapeType(shapeType);

                const canvasCoordinateArr: Coordinate[] = [];

                for (let j = 0; j < recordContents.length; j++) {
                    const realCoordinate: Coordinate = recordContents[j];
                    const canvasCoordinate: Coordinate = this.calculator.calculateRealCoordToCanvasCoord(this.canvas, realCoordinate, boundingBox);
                    const x: number = canvasCoordinate.x * geoCanvasInteract.zoom + geoCanvasInteract.panX;
                    const y: number = canvasCoordinate.y * geoCanvasInteract.zoom + geoCanvasInteract.panY;

                    canvasCoordinate.x = x;
                    canvasCoordinate.y = y;
                    canvasCoordinateArr.push({x, y});

                    this.drawPoint(canvasCoordinate.x, canvasCoordinate.y, geoCanvasInteract.radius);
                }
                layer.layerShape[i].shapeContents.canvasCoordinates = canvasCoordinateArr;
            } else {
                const partsCoordinates: Array<Coordinate>[] = recordContents.PartsCoordinates;
                this.setLineWidth(geoCanvasInteract.lineWidth);

                partsCoordinates.forEach((coordinatesPair: Coordinate[], pairIdx: number) => {
                    this.beginPath();

                    let canvasCoordinateArr: Coordinate[] = [];

                    Object.values(coordinatesPair).forEach((realCoordinate: Coordinate, idx: number) => {
                        const canvasCoordinate: Coordinate = this.calculator.calculateRealCoordToCanvasCoord(this.canvas, realCoordinate, boundingBox);
                        const x: number = canvasCoordinate.x * geoCanvasInteract.zoom + geoCanvasInteract.panX;
                        const y: number = canvasCoordinate.y * geoCanvasInteract.zoom + geoCanvasInteract.panY;

                        canvasCoordinate.x = x;
                        canvasCoordinate.y = y;
                        canvasCoordinateArr.push(canvasCoordinate);

                        this.drawPoly(canvasCoordinate.x, canvasCoordinate.y, idx);
                    });

                    layer.layerShape[i].shapeContents.canvasCoordinates[pairIdx] = canvasCoordinateArr;

                    this.closePath();
                    this._setStyleFromShapeType(shapeType);

                    if (shapeType === 5) {
                        this.fill();
                    }

                    this.stroke();
                });
            }
        }

        this.restore();
    }

    private _setStyleFromShapeType(shapeType: number): void {
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