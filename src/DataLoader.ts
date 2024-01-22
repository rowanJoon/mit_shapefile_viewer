import { ShapeHeader, Coordinate, PolyDataSet } from './type/Type.js';
import { Point } from './feature/Point.js';
import { Poly } from './feature/Poly.js';

export class DataLoader {
    private arrayBuffer: ArrayBuffer;
    private view: DataView;

    constructor(arrayBuffer: ArrayBuffer) {
        this.arrayBuffer = arrayBuffer;
        this.view = new DataView(arrayBuffer);
    }

    public loadPointData(shapeHeader: ShapeHeader, contentsOffset: number): Point {
        let coordinates: Coordinate[] = [];

        while (contentsOffset < this.arrayBuffer.byteLength) {
            let coordinate: Coordinate = { x: 0, y: 0 };
            const contentsLength: number = this.view.getInt32(contentsOffset + 4, false);
            const geometryData: ArrayBuffer = this.arrayBuffer.slice(
                contentsOffset + 8,
                contentsOffset + 8 + contentsLength * 2
            );
            const geometryView: DataView = new DataView(geometryData);
            const numPoints: number = contentsLength / 20;

            for (let i = 0, len = numPoints; i < len; i++) {
                const x: number = geometryView.getFloat64(i + 4, true);
                const y: number = geometryView.getFloat64(i + 12, true);

                coordinate.x = x;
                coordinate.y = y;

                coordinates.push({ ...coordinate });
            }

            contentsOffset += 8 + contentsLength * 2;
        }

        return new Point(shapeHeader, {
            contents: coordinates
        });
    }

    public loadPolyData(shapeHeader: ShapeHeader, offset: number): Poly {
        let polyDataset: PolyDataSet = {
            Box: {
                xMin: 0,
                yMin: 0,
                xMax: 0,
                yMax: 0
            },
            NumParts: 0,
            NumPoints: 0,
            Parts: [0],
            PartsCoordinates: []
        };

        while (offset < this.arrayBuffer.byteLength) {
            const contentLength: number = this.view.getInt32(offset + 4, false);
            const geometryData: ArrayBuffer = this.arrayBuffer.slice(
                offset + 8,
                offset + 8 + contentLength * 2
            );
            const geometryView: DataView = new DataView(geometryData);

            polyDataset.Box.xMin = geometryView.getFloat64(4, true);
            polyDataset.Box.yMin = geometryView.getFloat64(12, true);
            polyDataset.Box.xMax = geometryView.getFloat64(20, true);
            polyDataset.Box.yMax = geometryView.getFloat64(28, true);

            polyDataset.NumParts = geometryView.getInt32(36, true);
            polyDataset.NumPoints = geometryView.getInt32(40, true);

            for (let i = 0, len = polyDataset.NumParts; i < len; i += 4) {
                polyDataset.Parts.push(geometryView.getInt32(i + 44, true));
            }

            let xIndex: number = 48;
            let yIndex: number = 56;
            let points: { x: number; y: number }[] = [];

            for (let i = 0, len = polyDataset.NumPoints; i < len; i++) {
                const x: number = geometryView.getFloat64(xIndex, true);
                const y: number = geometryView.getFloat64(yIndex, true);

                xIndex += 16;
                yIndex += 16;

                points.push({ x, y });
                polyDataset.PartsCoordinates.push(points);
            }

            offset += 8 + contentLength * 2;
        }

        return new Poly(shapeHeader, { contents: polyDataset });
    }
}
