import {BoundingBox, Coordinate} from '../../types';
import {CommonPolyRecordContents, Shape, ShapeHeader, ShapeRecordContents} from "../feature/Shape";

interface Point {
    x: number;
    y: number;
}

interface Ring {
    points: Point[];
}

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
        const dataView: DataView = this.dataView;
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
                shape = this._loadPolylineData(shapeHeader);
                break;
            case 5:
                shape = this._loadPolygonData(shapeHeader);
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

    private _loadPolylineData(shapeHeader: ShapeHeader): Shape {
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

    private _loadPolygonData(shapeHeader: ShapeHeader): Shape {
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
                const xIndex: number = 44 + commonPolyRecordContents.NumParts * 4 + i * 16;
                const yIndex: number = xIndex + 8;
                const x: number = recordContentsDataView.getFloat64(xIndex, true);
                const y: number = recordContentsDataView.getFloat64(yIndex, true);

                points.push({ x, y });
            }

            if (commonPolyRecordContents.NumParts !== 1) {
                const [innerRings, outerRings] = this.identifyRings(commonPolyRecordContents.NumParts, commonPolyRecordContents.Parts, commonPolyRecordContents.NumPoints, points);
                const allRings: Ring[] = outerRings.concat(innerRings);
                const allPoints: Coordinate[] = [];

                allRings.forEach(ring => {
                    ring.points.forEach(point => {
                        allPoints.push(point);
                    });
                });

                commonPolyRecordContents.PartsCoordinates.push(allPoints);
            } else {
                commonPolyRecordContents.PartsCoordinates.push(points);
            }

            recordContentsOffset += 8 + recordContentsLength * 2;
        }

        const shapeRecordContents: ShapeRecordContents = {
            recordContents: commonPolyRecordContents,
            canvasCoordinates: []
        };

        return this._setShapeFields(shapeHeader, shapeRecordContents);
    }

    private identifyRings(numParts: number, parts: number[], numPoints: number, points: Point[]): [Ring[], Ring[]] {
        const rings: Ring[] = [];
        const innerRings: Ring[] = [];
        const outerRings: Ring[] = [];

        // 각 파트별로 포인트를 분할하고 링을 생성합니다.
        for (let i = 0; i < numParts; i++) {
            const startIdx: number = parts[i];
            const endIdx: number = i < numParts - 1 ? parts[i + 1] : numPoints;
            let ringPoints: Point[] = points.slice(startIdx, endIdx + 1);

            // 시계방향인 경우 점들의 순서를 조정합니다.
            if (!this.isClockwise(ringPoints)) {
                ringPoints = this.reversePoints(ringPoints);
            }

            // 다각형이 닫혀있지 않으면 마지막 점을 추가하여 닫습니다.
            if (ringPoints.length > 0) {
                const firstPoint: Point = ringPoints[0];
                const lastPoint: Point = ringPoints[ringPoints.length - 1];

                if (firstPoint && lastPoint && firstPoint.x !== undefined && firstPoint.y !== undefined &&
                    (firstPoint.x !== lastPoint.x || firstPoint.y !== lastPoint.y)) {
                    ringPoints.push({ x: firstPoint.x, y: firstPoint.y });
                }
            }

            rings.push({ points: ringPoints });
        }

        // 각 링에 대해 교차점 개수를 계산하고 내부 링과 외부 링을 식별합니다.
        for (let i = 0; i < numParts; i++) {
            const intersections: number = this.countIntersections(rings[i].points);

            // 교차하는 선분의 수가 홀수이면 내부 링, 짝수이면 외부 링으로 구분합니다.
            if (intersections % 2 === 0) {
                outerRings.push(rings[i]);
            } else {
                innerRings.push(rings[i]);
            }
        }

        return [innerRings, outerRings];
    }

    private reversePoints(points: Point[]): Point[] {
        return points.slice().reverse();
    }

    private isClockwise(points: Point[]): boolean {
        let sum: number = 0;
        const n: number = points.length;

        for (let i = 0; i < n; i++) {
            const current: Point = points[i];
            const next: Point = points[(i + 1) % n];

            sum += (next.x - current.x) * (next.y + current.y);
        }

        return sum > 0;
    }

    private countIntersections(points: Point[]): number {
        let count: number = 0;
        const n: number = points.length;

        // 각 포인트를 이용하여 선분을 생성하고 교차 여부를 확인합니다.
        for (let i = 0; i < n - 1; i++) {
            const p1: Point = points[i];
            const p2: Point = points[(i + 1) % n]; // 현재 포인트와 다음 포인트를 이용하여 선분을 만듭니다.

            for (let j = i + 2; j < n; j++) {
                const p3: Point = points[j];
                const p4: Point = points[(j + 1) % n]; // 다음 포인트와 그 다음 포인트를 이용하여 또 다른 선분을 만듭니다.

                if (this.doIntersect(p1, p2, p3, p4)) {
                    count++;
                }
            }
        }

        return count;
    }

    private doIntersect(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
        // 벡터를 생성합니다.
        const vec1: Point = { x: p2.x - p1.x, y: p2.y - p1.y };
        const vec2: Point = { x: p3.x - p1.x, y: p3.y - p1.y };
        const vec3: Point = { x: p4.x - p3.x, y: p4.y - p3.y };
        const vec4: Point = { x: p1.x - p3.x, y: p1.y - p3.y };

        // 외적 계산
        const crossProduct1: number = this.crossProduct(vec1, vec2);
        const crossProduct2: number = this.crossProduct(vec3, vec4); // vec3와 vec4 사이의 외적 계산

        // 외적의 부호를 이용하여 두 벡터가 같은 방향을 가지는지, 반대 방향을 가지는지 판단합니다.
        // 두 벡터가 서로 다른 방향을 가지면 교차합니다.
        return crossProduct1 * crossProduct2 < 0;
    }

    private crossProduct(vec1: Point, vec2: Point): number {
        return vec1.x * vec2.y - vec1.y * vec2.x;
    }

    private _setShapeFields(shapeHeader: ShapeHeader, shapeRecordContents: ShapeRecordContents): Shape {
        return new Shape(shapeHeader, shapeRecordContents);
    }
}
