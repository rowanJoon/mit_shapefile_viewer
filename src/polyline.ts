import { ShapeFileHeader, BoundingBox, Coordinate } from './main';

class Polyline {
    Box: BoundingBox = {} as BoundingBox;
    NumParts: number = 0;
    NumPoints: number = 0;
    Parts: number[] = [];
    PolylineCoordinates: Array<Coordinate>[] = [];

    constructor(xMin?: number, yMin?: number, xMax?: number, yMax?: number) {
        if (
            xMin !== undefined &&
            yMin !== undefined &&
            xMax !== undefined &&
            yMax !== undefined
        ) {
            this.Box = { xMin, yMin, xMax, yMax };
        }
    }
}

export function calculatePolylineData(arrayBuffer: ArrayBuffer): Polyline {
    const view = new DataView(arrayBuffer);
    const polyline = new Polyline(0, 0, 0, 0);
    let offset = 100;

    while (offset < arrayBuffer.byteLength) {
        const contentLength = view.getInt32(offset + 4, false);
        const geometryData = arrayBuffer.slice(
            offset + 8,
            offset + 8 + contentLength * 2
        );
        const geometryView = new DataView(geometryData);

        polyline.Box.xMin = geometryView.getFloat64(4, true);
        polyline.Box.yMin = geometryView.getFloat64(12, true);
        polyline.Box.xMax = geometryView.getFloat64(20, true);
        polyline.Box.yMax = geometryView.getFloat64(28, true);

        polyline.NumParts = geometryView.getInt32(36, true);
        polyline.NumPoints = geometryView.getInt32(40, true);

        for (let i = 0; i < polyline.NumParts; i++) {
            polyline.Parts.push(geometryView.getInt32(i + 44, true));
            i += 4;
        }

        let xIndex = 48;
        let yIndex = 56;
        let points: { x: number; y: number }[] = [];

        for (let i = 0; i < polyline.NumPoints; i++) {
            const x = geometryView.getFloat64(xIndex, true);
            const y = geometryView.getFloat64(yIndex, true);

            xIndex += 16;
            yIndex += 16;

            points.push({ x, y });
            polyline.PolylineCoordinates.push(points);
        }

        offset += 8 + contentLength * 2;
    }

    return polyline;
}

export function PolylineGeometryRenderWebPage(
    header: ShapeFileHeader,
    polylineData: Polyline
): void {
    const canvas = document.querySelector(
        '#polylineCanvas'
    ) as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        console.error('Unable to get 2D context');
        return;
    }

    polylineData.PolylineCoordinates.forEach(coords => {
        ctx.beginPath();

        coords.forEach((coord, idx) => {
            const x = coord.x;
            const y = coord.y;

            if (x !== undefined && y !== undefined) {
                const renderX =
                    ((x - header.boundingBox.xMin) /
                        (header.boundingBox.xMax - header.boundingBox.xMin)) *
                    canvas.width;
                const renderY =
                    canvas.height -
                    ((y - header.boundingBox.yMin) /
                        (header.boundingBox.yMax - header.boundingBox.yMin)) *
                        canvas.height;

                if (idx === 0) {
                    ctx.moveTo(renderX, renderY);
                } else {
                    ctx.lineTo(renderX, renderY);
                }
            }
        });

        ctx.stroke();
    });
}
