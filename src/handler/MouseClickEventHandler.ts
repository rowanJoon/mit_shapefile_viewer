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
        this.geoCanvasInteract.mouseX = e.clientX - this.geoCanvasInteract.canvas.getBoundingClientRect().left;
        this.geoCanvasInteract.mouseY = e.clientY - this.geoCanvasInteract.canvas.getBoundingClientRect().top;
        this.geoCanvasInteract.canvasX = (this.geoCanvasInteract.mouseX - this.geoCanvasInteract.panX) / this.geoCanvasInteract.zoom;
        this.geoCanvasInteract.canvasY = (this.geoCanvasInteract.mouseY - this.geoCanvasInteract.panY) / this.geoCanvasInteract.zoom;

        const mouseClickCoordinate: Coordinate = {
            x: this.geoCanvasInteract.canvasX,
            y: this.geoCanvasInteract.canvasY,
        };
        const layer: Shape[] = this.layer.getLayer();
        const dbaseData: RecordData[] = this.layer.getLayerData();
        let expressDbaseData: { shapeType: number, dbaseData: string | number }[] = [{
            shapeType: 0,
            dbaseData: ''
        }];

        console.log('mouse click coord: ', mouseClickCoordinate);

        for (let i = 0; i < layer.length; i++) {
            const recordContents: Coordinate[] | CommonPolyRecordContents = layer[i].shapeContents.recordContents;
            const canvasCoordinates: Coordinate[] | Array<Coordinate>[] = layer[i].shapeContents.canvasCoordinates;

            if (Array.isArray(recordContents)) {
                const linearCoordinate = this._pointLinearSearch(canvasCoordinates as Coordinate[], mouseClickCoordinate);

                for (let j = 0; j < canvasCoordinates.length; j++) {
                    if (this._areNumbersEqual((canvasCoordinates[j] as Coordinate).x, (linearCoordinate as Coordinate).x) && this._areNumbersEqual((canvasCoordinates[j] as Coordinate).y, (linearCoordinate as Coordinate).y)) {
                        expressDbaseData.push({
                            shapeType: layer[i].shapeHeader.shapeType,
                            dbaseData: dbaseData[i][j] !== undefined ? dbaseData[i][j] : [][j]
                        });
                    }
                }
            } else {
                const linearCoordinates = this._polyLinearSearch(canvasCoordinates as Array<Array<Coordinate>>, mouseClickCoordinate);

                for (let j = 0; j < canvasCoordinates.length; j++) {
                    const canvasCoordinate = canvasCoordinates[j];

                    if (this._areArraysEqual(canvasCoordinate as Coordinate[], linearCoordinates as Coordinate[])) {
                        expressDbaseData.push({
                            shapeType: layer[i].shapeHeader.shapeType,
                            dbaseData: dbaseData[i][j] !== undefined ? dbaseData[i][j] : [][j]
                        });
                    }
                }
            }
        }

        this._expressionDbaseData(expressDbaseData);
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
