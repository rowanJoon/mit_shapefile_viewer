import { ShapeFileHeader, Coordinate } from './main';

export function calculatePointData(arrayBuffer: ArrayBuffer) {
    const view = new DataView(arrayBuffer);
    const points: Coordinate[] = [];
    let offset = 100;

    while (offset < arrayBuffer.byteLength) {
        const contentLength = view.getInt32(offset + 4, false);
        const geometryData = arrayBuffer.slice(
            offset + 8,
            offset + 8 + contentLength * 2
        );
        const geometryView = new DataView(geometryData);
        const numPoints = contentLength / 20;

        for (let i = 0; i < numPoints; i++) {
            const x = geometryView.getFloat64(i + 4, true);
            const y = geometryView.getFloat64(i + 12, true);

            points.push({ x, y });
        }

        offset += 8 + contentLength * 2;
    }

    return points;
}

export function PointGeometryRenderWebPage(
    header: ShapeFileHeader,
    coordinates: { x: number; y: number }[]
): void {
    const canvas = document.querySelector('#pointCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        console.error('Unable to get 2D context');
        return;
    }

    for (const coord of coordinates) {
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

            ctx.beginPath();
            ctx.arc(renderX, renderY, 2, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}
