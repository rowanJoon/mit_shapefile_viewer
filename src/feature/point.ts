import { ShapeFileHeader, Coordinate, MapInteractor } from '../main.js';
import { mapPanning } from '../util/interact.js';

export function calculatePointData(arrayBuffer: ArrayBuffer) {
    const view: DataView = new DataView(arrayBuffer);
    const points: Coordinate[] = [];
    let offset: number = 100;

    while (offset < arrayBuffer.byteLength) {
        const contentLength: number = view.getInt32(offset + 4, false);
        const geometryData: ArrayBuffer = arrayBuffer.slice(
            offset + 8,
            offset + 8 + contentLength * 2
        );
        const geometryView: DataView = new DataView(geometryData);
        const numPoints: number = contentLength / 20;

        for (let i = 0, len = numPoints; i < len; i++) {
            const x: number = geometryView.getFloat64(i + 4, true);
            const y: number = geometryView.getFloat64(i + 12, true);

            points.push({ x, y });
        }

        offset += 8 + contentLength * 2;
    }

    return points;
}

export function pointGeometryRenderWebPage(
    header: ShapeFileHeader,
    coordinates: { x: number; y: number }[],
    mapInteractor: MapInteractor
): void {
    const canvas = document.querySelector('#pointCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        console.error('Unable to get 2D context');
        return;
    }

    for (const coord of coordinates) {
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

            ctx.beginPath();
            ctx.arc(renderX, renderY, 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
        }
    }

    mapPanning(header, canvas, coordinates, mapInteractor);
}

export function updatePointGeometryRenderWebPage(
    header: ShapeFileHeader,
    canvas: HTMLCanvasElement,
    coordinates: { x: number; y: number }[],
    mapInteractor: MapInteractor
) {
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        console.error('Unable to get 2D context');
        return;
    }

    console.log(mapInteractor);

    let mapWidth = ctx.getImageData(0, 0, canvas.width, canvas.height).width;
    let mapHeight = ctx.getImageData(0, 0, canvas.width, canvas.height).height;

    ctx.clearRect(0, 0, mapWidth, mapHeight);
    ctx.save();
    ctx.translate(mapInteractor.panX, mapInteractor.panY);
    ctx.scale(mapInteractor.zoom, mapInteractor.zoom);

    for (const coord of coordinates) {
        const x: number = coord.x;
        const y: number = coord.y;

        if (x !== undefined && y !== undefined) {
            const renderX: number =
                ((x - header.boundingBox.xMin) /
                    (header.boundingBox.xMax - header.boundingBox.xMin)) *
                mapWidth;
            const renderY: number =
                mapHeight -
                ((y - header.boundingBox.yMin) /
                    (header.boundingBox.yMax - header.boundingBox.yMin)) *
                    mapHeight;

            ctx.beginPath();
            ctx.arc(renderX, renderY, 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
        }
    }
    ctx.restore();
}
