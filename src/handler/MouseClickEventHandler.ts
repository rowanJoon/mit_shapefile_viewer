import {GeoCanvasEventHandler} from './GeoCanvasEventHandler';
import {BoundingBox, Coordinate, GeoCanvasInteract} from '../../types';
import {ShapeRender} from "../render/ShapeRender";
import {Layer} from "../render/Layer";
import {CommonPolyRecordContents, Shape} from "../feature/Shape";
import {RecordData} from "../loader/DbaseDataLoader";
import {LinearSearch} from "../util/LinearSearch";
import {Calculator} from "../util/Calculator";
import {DbaseRender} from "../render/DbaseRender";

export class MouseClickEventHandler extends GeoCanvasEventHandler {
    public calculate: Calculator;
    public linearSearch: LinearSearch;
    public dbaseRender: DbaseRender;

    constructor(shapeRender: ShapeRender, boundingBox: BoundingBox, geoCanvasInteract: GeoCanvasInteract, layer: Layer) {
        super(shapeRender, boundingBox, geoCanvasInteract, layer);
        this.calculate = new Calculator();
        this.linearSearch = new LinearSearch();
        this.dbaseRender = new DbaseRender();
    }

    public handleEvent(e: MouseEvent): void {
        const layer: Shape[] = this.layer.getLayer();
        const dbaseData: RecordData[] = this.layer.getLayerData();
        const geoCanvasInteract: GeoCanvasInteract = this.geoCanvasInteract;
        geoCanvasInteract.mouseX = e.clientX - geoCanvasInteract.canvas.getBoundingClientRect().left;
        geoCanvasInteract.mouseY = e.clientY - geoCanvasInteract.canvas.getBoundingClientRect().top;
        geoCanvasInteract.canvasX = geoCanvasInteract.mouseX / geoCanvasInteract.zoom - geoCanvasInteract.panX;
        geoCanvasInteract.canvasY = geoCanvasInteract.mouseY / geoCanvasInteract.zoom - geoCanvasInteract.panY;

        const mouseClickCoordinate: Coordinate = {
            x: geoCanvasInteract.canvasX,
            y: geoCanvasInteract.canvasY,
        };
        const expressDbaseData: { shapeType: number, dbaseData: string | number }[] = [{
            shapeType: 0,
            dbaseData: ''
        }];
        const calculate: Calculator = this.calculate;
        const linearSearch: LinearSearch = this.linearSearch;

        for (let i = 0; i < layer.length; i++) {
            const recordContents: Coordinate[] | CommonPolyRecordContents = layer[i].shapeContents.recordContents;
            const canvasCoordinates: Coordinate[] | Array<Coordinate>[] = layer[i].shapeContents.canvasCoordinates;

            if (Array.isArray(recordContents)) {
                const linearCoordinate: Coordinate | null = linearSearch.singleLinearSearch(canvasCoordinates as Coordinate[], mouseClickCoordinate);

                for (let j = 0; j < canvasCoordinates.length; j++) {
                    if (calculate.areNumberIsEqual((canvasCoordinates[j] as Coordinate).x, (linearCoordinate as Coordinate).x) &&
                        calculate.areNumberIsEqual((canvasCoordinates[j] as Coordinate).y, (linearCoordinate as Coordinate).y)) {
                        expressDbaseData.push({
                            shapeType: layer[i].shapeHeader.shapeType,
                            dbaseData: dbaseData[i][j] !== undefined ? dbaseData[i][j] : [][j]
                        });
                    }
                }
            } else {
                const linearCoordinates: Coordinate[] | null = linearSearch.multiLinearSearch(canvasCoordinates as Array<Array<Coordinate>>, mouseClickCoordinate);

                for (let j = 0; j < canvasCoordinates.length; j++) {
                    const canvasCoordinate: Coordinate | Coordinate[] = canvasCoordinates[j];

                    if (calculate.areArrayIsEqual(canvasCoordinate as Coordinate[], linearCoordinates as Coordinate[])) {
                        expressDbaseData.push({
                            shapeType: layer[i].shapeHeader.shapeType,
                            dbaseData: dbaseData[i][j] !== undefined ? dbaseData[i][j] : [][j]
                        });
                    }
                }
            }
        }

        this.dbaseRender.expressionDbaseData(expressDbaseData);
    }
}
