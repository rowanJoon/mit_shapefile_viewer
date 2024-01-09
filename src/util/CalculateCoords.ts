// import { BoundingBox, Coordinate } from '../main';
import { Point } from '../feature/point/Point.js';

// export type Feature {
//     Box: BoundingBox = {} as BoundingBox;
//     NumParts: number = 0;
//     NumPoints: number = 0;
//     Parts: number[] = [];
//     FeatureCoordinates: Array<Coordinate>[] = [];
// }

export class CoordsCalculator {
    private arrayBuffer: ArrayBuffer;
    private view: DataView;

    constructor(arrayBuffer: ArrayBuffer) {
        this.arrayBuffer = arrayBuffer;
        this.view = new DataView(arrayBuffer);
    }

    public calculateData(headerType: number) {
        let offset: number = 100;

        if (headerType === 1) {
            return this.calculatePointData(headerType, offset);
        }
    }

    private calculatePointData(headerType: number, offset: number): Point {
        let coordinate = [];

        while (offset < this.arrayBuffer.byteLength) {
            const contentLength: number = this.view.getInt32(offset + 4, false);
            const geometryData: ArrayBuffer = this.arrayBuffer.slice(
                offset + 8,
                offset + 8 + contentLength * 2
            );
            const geometryView: DataView = new DataView(geometryData);
            const numPoints: number = contentLength / 20;

            for (let i = 0, len = numPoints; i < len; i++) {
                const x: number = geometryView.getFloat64(i + 4, true);
                const y: number = geometryView.getFloat64(i + 12, true);

                coordinate.push({ x, y });
            }

            offset += 8 + contentLength * 2;
        }

        const point: Point = new Point(headerType, coordinate);

        return point;
    }

    // private calculateData(offset: number): Coordinate[] {
    //     const points: Coordinate[] = [];

    //     while (offset < this.arrayBuffer.byteLength) {
    //         const contentLength: number = view.getInt32(offset + 4, false);
    //     const geometryData: ArrayBuffer = arrayBuffer.slice(
    //         offset + 8,
    //         offset + 8 + contentLength * 2
    //     );
    //     const geometryView: DataView = new DataView(geometryData);

    //     feature.Box.xMin = geometryView.getFloat64(4, true);
    //     feature.Box.yMin = geometryView.getFloat64(12, true);
    //     feature.Box.xMax = geometryView.getFloat64(20, true);
    //     feature.Box.yMax = geometryView.getFloat64(28, true);

    //     feature.NumParts = geometryView.getInt32(36, true);
    //     feature.NumPoints = geometryView.getInt32(40, true);

    //     for (let i = 0, len = feature.NumParts; i < len; i += 4) {
    //         feature.Parts.push(geometryView.getInt32(i + 44, true));
    //     }

    //     let xIndex: number = 48;
    //     let yIndex: number = 56;
    //     let points: { x: number; y: number }[] = [];

    //     for (let i = 0, len = feature.NumPoints; i < len; i++) {
    //         const x: number = geometryView.getFloat64(xIndex, true);
    //         const y: number = geometryView.getFloat64(yIndex, true);

    //         xIndex += 16;
    //         yIndex += 16;

    //         points.push({ x, y });
    //         feature.FeatureCoordinates.push(points);
    //     }

    //     offset += 8 + contentLength * 2;
    //     }
    // }
}

// export function calculateFeatureData(arrayBuffer: ArrayBuffer): Feature {
//     const view: DataView = new DataView(arrayBuffer);
//     const feature: Feature = new Feature();
//     let offset: number = 100;

//     while (offset < arrayBuffer.byteLength) {
//         const contentLength: number = view.getInt32(offset + 4, false);
//         const geometryData: ArrayBuffer = arrayBuffer.slice(
//             offset + 8,
//             offset + 8 + contentLength * 2
//         );
//         const geometryView: DataView = new DataView(geometryData);

//         feature.Box.xMin = geometryView.getFloat64(4, true);
//         feature.Box.yMin = geometryView.getFloat64(12, true);
//         feature.Box.xMax = geometryView.getFloat64(20, true);
//         feature.Box.yMax = geometryView.getFloat64(28, true);

//         feature.NumParts = geometryView.getInt32(36, true);
//         feature.NumPoints = geometryView.getInt32(40, true);

//         for (let i = 0, len = feature.NumParts; i < len; i += 4) {
//             feature.Parts.push(geometryView.getInt32(i + 44, true));
//         }

//         let xIndex: number = 48;
//         let yIndex: number = 56;
//         let points: { x: number; y: number }[] = [];

//         for (let i = 0, len = feature.NumPoints; i < len; i++) {
//             const x: number = geometryView.getFloat64(xIndex, true);
//             const y: number = geometryView.getFloat64(yIndex, true);

//             xIndex += 16;
//             yIndex += 16;

//             points.push({ x, y });
//             feature.FeatureCoordinates.push(points);
//         }

//         offset += 8 + contentLength * 2;
//     }

//     return feature;
// }
