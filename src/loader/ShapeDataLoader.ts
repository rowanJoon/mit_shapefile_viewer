import {BoundingBox, Coordinate} from '../../types';
import {CommonPolyRecordContents, Shape, ShapeHeader, ShapeRecordContents} from "../feature/Shape";

export class ShapeDataLoader {
    private readonly arrayBuffer: ArrayBuffer;
    private readonly dataView: DataView;
    private recordContentsOffset: number = 100;

    constructor(arrayBuffer: ArrayBuffer) {
        this.arrayBuffer = arrayBuffer;
        this.dataView = new DataView(arrayBuffer);
    }

    public getHeader(view: DataView): ShapeHeader {
        return {
            fileCode: view.getInt32(0),
            fileLength: view.getInt32(24),
            version: view.getInt32(28, true),
            shapeType: view.getInt32(32, true),
            boundingBox: this._getBoundingBox(view)
        };
    }

    public loadShapeHeader(): ShapeHeader {
        const dataView = this.dataView;
        return this.getHeader(dataView);
    }

    public loadShapeData(): Shape {
        const shapeHeader: ShapeHeader = this.loadShapeHeader();
        const shapeType: number = shapeHeader.shapeType;
        let shape: Shape;

        switch (shapeType) {
            case 1:
                shape = this._loadPointData(shapeHeader);
                break;
            case 3:
            case 5:
                shape = this._loadPolyData(shapeHeader);
                break;
            default:
                throw new Error(`Unsupported shapeType: ${shapeType}`);
        }

        return shape;
    }

    private _getBoundingBox(view: DataView): BoundingBox {
        return {
            xMin: view.getFloat64(36, true),
            yMin: view.getFloat64(44, true),
            xMax: view.getFloat64(52, true),
            yMax: view.getFloat64(60, true)
        };
    }

    private _loadPointData(shapeHeader: ShapeHeader): Shape {
        const arrayBuffer: ArrayBuffer = this.arrayBuffer;
        const dataView: DataView = this.dataView;
        let recordContentsOffset: number = this.recordContentsOffset;
        let coordinatesArr: Coordinate[] = [];

        while (recordContentsOffset < arrayBuffer.byteLength) {
            const recordContentsLength: number = dataView.getInt32(recordContentsOffset + 4, false);
            const recordContentsArrayBuffer: ArrayBuffer = this.arrayBuffer.slice(recordContentsOffset + 8, recordContentsOffset + 8 + recordContentsLength * 2);
            const recordContentsDataView: DataView = new DataView(recordContentsArrayBuffer);
            const numPoints: number = recordContentsLength / 20;
            let coordinate: Coordinate = { x: 0, y: 0 };

            for (let i = 0, len = numPoints; i < len; i++) {
                const x: number = recordContentsDataView.getFloat64(i + 4, true);
                const y: number = recordContentsDataView.getFloat64(i + 12, true);

                coordinate.x = x;
                coordinate.y = y;

                coordinatesArr.push({ ...coordinate });
            }

            recordContentsOffset += 8 + recordContentsLength * 2;
        }

        const shapeRecordContents: ShapeRecordContents = {
            recordContents: coordinatesArr,
            canvasCoordinates: []
        };

        return this._setShapeFields(shapeHeader, shapeRecordContents);
    }

    private _loadPolyData(shapeHeader: ShapeHeader): Shape {
        const arrayBuffer: ArrayBuffer = this.arrayBuffer;
        const dataView: DataView = this.dataView;
        let recordContentsOffset: number = this.recordContentsOffset;
        let commonPolyRecordContents: CommonPolyRecordContents = {
            Box: {
                xMin: 0,
                yMin: 0,
                xMax: 0,
                yMax: 0
            },
            NumParts: 0,
            NumPoints: 0,
            Parts: [],
            PartsCoordinates: []
        };

        while (recordContentsOffset < arrayBuffer.byteLength) {
            const recordContentsLength: number = dataView.getInt32(recordContentsOffset + 4, false);
            const recordContentsArrayBuffer: ArrayBuffer = this.arrayBuffer.slice(recordContentsOffset + 8, recordContentsOffset + 8 + recordContentsLength * 2);
            const recordContentsDataView: DataView = new DataView(recordContentsArrayBuffer);
            let xIndex: number = 48;
            let yIndex: number = 56;

            commonPolyRecordContents.Box.xMin = recordContentsDataView.getFloat64(4, true);
            commonPolyRecordContents.Box.yMin = recordContentsDataView.getFloat64(12, true);
            commonPolyRecordContents.Box.xMax = recordContentsDataView.getFloat64(20, true);
            commonPolyRecordContents.Box.yMax = recordContentsDataView.getFloat64(28, true);

            commonPolyRecordContents.NumParts = recordContentsDataView.getInt32(36, true);
            commonPolyRecordContents.NumPoints = recordContentsDataView.getInt32(40, true);

            for (let i = 0; i < commonPolyRecordContents.NumParts; i++) {
                commonPolyRecordContents.Parts.push(recordContentsDataView.getInt32(44 + i * 4, true))
            }

            const points: { x: number; y: number }[] = [];
            for (let i = 0; i < commonPolyRecordContents.NumPoints; i++) {
                const x: number = recordContentsDataView.getFloat64(xIndex, true);
                const y: number = recordContentsDataView.getFloat64(yIndex, true);

                xIndex += 16;
                yIndex += 16;

                points.push({ x, y });
            }
            commonPolyRecordContents.PartsCoordinates.push(points);

            recordContentsOffset += 8 + recordContentsLength * 2;
        }

        const shapeRecordContents: ShapeRecordContents = {
            recordContents: commonPolyRecordContents,
            canvasCoordinates: []
        };

        return this._setShapeFields(shapeHeader, shapeRecordContents);
    }

    private _setShapeFields(shapeHeader: ShapeHeader, shapeRecordContents: ShapeRecordContents): Shape {
        return new Shape(shapeHeader, shapeRecordContents);
    }
}
