import { ShapeFileHeader, BoundingBox, Coordinate } from './main';

class Polygon {
    Box: BoundingBox = {} as BoundingBox;
    NumParts: number = 0;
    NumPoints: number = 0;
    Parts: number[] = [];
    PolygonCoordinates: Array<Coordinate>[] = [];

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

export function calculatePolygonData(arrayBuffer: ArrayBuffer): Polygon {
    const view: DataView = new DataView(arrayBuffer);
    const polygon: Polygon = new Polygon();
    let offset: number = 100;

    while (offset < arrayBuffer.byteLength) {
        const contentLength: number = view.getInt32(offset + 4, false);
        const geometryData: ArrayBuffer = arrayBuffer.slice(
            offset + 8,
            offset + 8 + contentLength * 2
        );
        const geometryView: DataView = new DataView(geometryData);

        polygon.Box.xMin = geometryView.getFloat64(4, true);
        polygon.Box.yMin = geometryView.getFloat64(12, true);
        polygon.Box.xMax = geometryView.getFloat64(20, true);
        polygon.Box.yMax = geometryView.getFloat64(28, true);

        polygon.NumParts = geometryView.getInt32(36, true);
        polygon.NumPoints = geometryView.getInt32(40, true);

        for (let i = 0, len = polygon.NumParts; i < len; i += 4) {
            polygon.Parts.push(geometryView.getInt32(i + 44, true));
        }

        let xIndex: number = 48;
        let yIndex: number = 56;
        let points: { x: number; y: number }[] = [];

        for (let i = 0, len = polygon.NumPoints; i < len; i++) {
            const x: number = geometryView.getFloat64(xIndex, true);
            const y: number = geometryView.getFloat64(yIndex, true);

            xIndex += 16;
            yIndex += 16;

            points.push({ x, y });
            polygon.PolygonCoordinates.push(points);
        }

        offset += 8 + contentLength * 2;
    }

    return polygon;
}

export function PolygonGeometryRenderWebPage(
    header: ShapeFileHeader,
    polygonData: Polygon
): void {
    console.log(polygonData);
    const canvas = document.querySelector(
        '#polygonCanvas'
    ) as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        console.error('Unable to get 2D context');
        return;
    }

    polygonData.PolygonCoordinates.forEach(coords => {
        ctx.beginPath();

        coords.forEach((coord, idx) => {
            const x: number = coord.x;
            const y: number = coord.y;

            if (x !== undefined && y !== undefined) {
                const renderX: number =
                    ((x - header.boundingBox.xMin) /
                        (header.boundingBox.xMax - header.boundingBox.xMin)) *
                    canvas.width;
                const renderY: number =
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

        ctx.fillStyle = 'green';
        ctx.fill();
        ctx.stroke();
    });
}
