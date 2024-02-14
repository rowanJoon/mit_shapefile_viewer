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

export class ShapeRender extends ShapeRenderEngine {
    private readonly shape: Shape;
    private readonly layer: Layer;
    private eventDelegator: EventDelegator;

    constructor(canvasId: string, shape: Shape, layer: Layer, eventDelegator: EventDelegator) {
        super(canvasId);
        this.shape = shape;
        this.layer = layer;
        this.eventDelegator = eventDelegator;
    }

    public render(geoCanvasInteract: GeoCanvasInteract): void {
        const layer: Layer = this.layer;
        layer.addLayer(this.shape);

        const boundingBox: BoundingBox = this._calculateLargestBoundingBox(layer);
        console.log(boundingBox);
        console.log(layer);
        this._renderingCanvas(geoCanvasInteract, boundingBox);
        this._setMouseEvent(geoCanvasInteract, boundingBox);
    }

    private _renderingCanvas(geoCanvasInteract: GeoCanvasInteract, boundingBox: BoundingBox): void {
        const layer: Layer = this.layer;
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
                const canvasCoordinates: Coordinate[] = [];

                for (let j = 0; j < recordContents.length; j++) {
                    let canvasCoordinate: Coordinate = {
                        x: 0,
                        y: 0,
                    };
                    canvasCoordinate = this.convertRealCoordToCanvasCoord(recordContents[j], boundingBox);
                    const x: number = canvasCoordinate.x * geoCanvasInteract.zoom + geoCanvasInteract.panX;
                    const y: number = canvasCoordinate.y * geoCanvasInteract.zoom + geoCanvasInteract.panY;
                    canvasCoordinates.push({x, y});

                    this.drawPoint(canvasCoordinate.x, canvasCoordinate.y, geoCanvasInteract.radius);
                    this._setShapeStyleFromType(shapeType);
                }

                layer.layerShape[i].shapeContents.canvasCoordinates = canvasCoordinates;
            } else {
                const partsCoordinates: Array<Coordinate>[] = recordContents.PartsCoordinates;
                this.setLineWidth(geoCanvasInteract.lineWidth);

                partsCoordinates.forEach((coordPair: Coordinate[], pairIdx: number) => {
                    this.beginPath();

                    let canvasCoordinates: Coordinate[] = [];

                    Object.values(coordPair).forEach((coord: Coordinate, idx: number) => {
                        let canvasCoordinate: Coordinate;
                        canvasCoordinate = this.convertRealCoordToCanvasCoord(coord, boundingBox);
                        const x: number = canvasCoordinate.x * geoCanvasInteract.zoom + geoCanvasInteract.panX;
                        const y: number = canvasCoordinate.y * geoCanvasInteract.zoom + geoCanvasInteract.panY;
                        canvasCoordinate.x = x;
                        canvasCoordinate.y = y;
                        canvasCoordinates.push(canvasCoordinate);

                        this.drawPoly(canvasCoordinate.x, canvasCoordinate.y, idx);
                    });

                    layer.layerShape[i].shapeContents.canvasCoordinates[pairIdx] = canvasCoordinates;

                    this.closePath();
                    this._setShapeStyleFromType(shapeType);

                    if (shapeType === 5) {
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

    private _setMouseEvent(geoCanvasInteract: GeoCanvasInteract, boundingBox: BoundingBox): void {
        if (this.eventDelegator.eventListeners.size !== 0) {
            this._removeMouseEventHandler();
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

    private _removeMouseEventHandler(): void {
        this.eventDelegator.removeAllEventListeners();
    }
}