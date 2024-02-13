import {GeoCanvasEventHandler} from './GeoCanvasEventHandler';
import {BoundingBox, Coordinate, GeoCanvasInteract} from '../../types';
import {ShapeRender} from "../render/ShapeRender";
import {Layer} from "../render/Layer";
import {CommonPolyRecordContents, Shape} from "../feature/Shape";
import {RecordData} from "../loader/DbaseDataLoader";

export class MouseClickEventHandler extends GeoCanvasEventHandler {
    constructor(shapeRender: ShapeRender, boundingBox: BoundingBox, geoCanvasInteract: GeoCanvasInteract, layer: Layer) {
        super(shapeRender, boundingBox, geoCanvasInteract, layer);
    }

    public handleEvent(e: MouseEvent): void {
        const mouseX: number = e.clientX - this.geoCanvasInteract.canvas.getBoundingClientRect().left;
        const mouseY: number = e.clientY - this.geoCanvasInteract.canvas.getBoundingClientRect().top;
        const canvasX: number = (mouseX - this.geoCanvasInteract.panX) / this.geoCanvasInteract.zoom;
        const canvasY: number = (mouseY - this.geoCanvasInteract.panY) / this.geoCanvasInteract.zoom;
        const mouseClickCoordinate: Coordinate = {
            x: canvasX,
            y: canvasY,
        };
        const canvasCoordToRealCoord: Coordinate = this.shapeRender.convertCanvasCoordToRealCoord(mouseClickCoordinate, this.boundingBox);
        const layer: Shape[] = this.layer.getLayer();
        const layerData: RecordData[] = this.layer.getLayerData();
        let dbaseData: { shapeType: number, dbaseData: string | number }[] = [{
            shapeType: 0,
            dbaseData: ''
        }];

        for (let i = 0; i < layer.length; i++) {
            const recordContents: Coordinate[] | CommonPolyRecordContents = layer[i].shapeContents.recordContents;

            if (Array.isArray(recordContents)) {
                const linearCoordinate: Coordinate | null = this._pointLinearSearch(recordContents, canvasCoordToRealCoord);

                for (let j = 0; j < recordContents.length; j++) {
                    if (this._areNumbersEqual(recordContents[j].x, (linearCoordinate as Coordinate).x) && this._areNumbersEqual(recordContents[j].y, (linearCoordinate as Coordinate).y)) {
                        dbaseData.push({
                            shapeType: layer[i].shapeHeader.shapeType,
                            dbaseData: layerData[i][j] !== undefined ? layerData[i][j] : [][j]
                        });
                    }
                }
            } else {
                const partsCoordinates: Array<Coordinate>[] = recordContents.PartsCoordinates;
                const linearCoordinates: Coordinate[] | null = this._polyLinearSearch(partsCoordinates, canvasCoordToRealCoord);

                for (let j = 0; j < partsCoordinates.length; j++) {
                    const partsCoordinate: Coordinate[] = partsCoordinates[j];

                    if (this._areArraysEqual(partsCoordinate, linearCoordinates)) {
                        dbaseData.push({
                            shapeType: layer[i].shapeHeader.shapeType,
                            dbaseData: layerData[i][j] !== undefined ? layerData[i][j] : [][j]
                        });
                    }
                }
            }
        }

        this._expressionDbaseData(dbaseData);
    }

    private _pointLinearSearch(coordinates: Coordinate[], targetCoordinate: Coordinate): Coordinate | null {
        let minDistance: number = Number.MAX_VALUE;
        let closetCoordinate = null;

        for (let i = 0; i < coordinates.length; i++) {
            const coordinate: Coordinate = coordinates[i];
            const distanceX: number = Math.abs((coordinate.x - targetCoordinate.x));
            const distanceY: number = Math.abs((coordinate.y - targetCoordinate.y));
            const distance: number = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            if (distance < minDistance) {
                minDistance = distance;
                closetCoordinate = coordinate;
            }
        }

        return closetCoordinate;
    }

    private _polyLinearSearch(coordinates: Array<Array<Coordinate>>, targetCoordinate: Coordinate): Array<Coordinate> | null {
        let minDistance: number = Number.MAX_VALUE;
        let closetCoordinateArray: Array<Coordinate> | null = null;

        for (let i = 0; i < coordinates.length; i++) {
            const coordinate: Array<Coordinate> = coordinates[i];
            let minDistanceForCoordinate: number = Number.MAX_VALUE;

            for (let j = 0; j < coordinate.length; j++) {
                const distanceX: number = Math.abs(coordinate[j].x - targetCoordinate.x);
                const distanceY: number = Math.abs(coordinate[j].y - targetCoordinate.y);
                const distance: number = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

                if (distance < minDistanceForCoordinate) {
                    minDistanceForCoordinate = distance;
                }
            }

            if (minDistanceForCoordinate < minDistance) {
                minDistance = minDistanceForCoordinate;
                closetCoordinateArray = coordinate;
            }
        }

        return closetCoordinateArray;
    }

    private _areArraysEqual(realCoordinateArray: Coordinate[], linearCoordinateArray: Coordinate[] | null): boolean {
        if (linearCoordinateArray === null) {
            return false;
        }

        const linearArray: Coordinate[] = Array.isArray(linearCoordinateArray) ? linearCoordinateArray : [linearCoordinateArray];

        if (realCoordinateArray.length !== linearArray.length) {
            return false;
        }

        for (let i = 0; i < realCoordinateArray.length; i++) {
            const realCoordinate: Coordinate = realCoordinateArray[i];
            const linearCoordinate: Coordinate = linearArray[i];

            if (!this._areNumbersEqual(realCoordinate.x, linearCoordinate.x) || !this._areNumbersEqual(realCoordinate.y, linearCoordinate.y)) {
                return false;
            }
        }

        return true;
    }

    private _areNumbersEqual(num1: number, num2: number): boolean {
        const epsilon = 1e-15;
        return Math.abs(num1 - num2) < epsilon;
    }

    private _expressionDbaseData(dbaseData: { shapeType: number, dbaseData: string | number }[]): void {
        const jsonTextField: HTMLInputElement = document.getElementById('featureInfoArea') as HTMLInputElement;
        let jsonData: { data: { [key: string]: string | number } } = { data: {} };

        if (!dbaseData) {
            jsonData.data['message'] = 'dbf 파일을 선택하세요.';
        } else {
            for (let i = 0; i < dbaseData.length; i++) {
                let dbaseDataName = '';
                if (dbaseData[i].shapeType === 1) {
                    dbaseDataName = 'point';
                } else if (dbaseData[i].shapeType === 3) {
                    dbaseDataName = 'polyline';
                } else if (dbaseData[i].shapeType === 5) {
                    dbaseDataName = 'polygon';
                }

                if (dbaseDataName !== '') {
                    jsonData.data[dbaseDataName] = dbaseData[i].dbaseData;
                }
            }
        }

        jsonTextField.value = JSON.stringify(jsonData, null, 2);
    }
}
