interface ShapeFileHeader {
    fileCode: number;
    fileLength: number;
    version: number;
    shapeType: number;
    boundingBox: BoundingBox;
}

interface BoundingBox {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
}

interface Coordinate {
    x: number;
    y: number;
}

class Polyline {
    Box: BoundingBox = {} as BoundingBox;
    NumParts: number = 0;
    NumPoints: number = 0;
    Parts: number[] = [];
    // Points: { x: number; y: number }[] = [];
    Points: Array<Coordinate>[] = [];

    constructor(xMin: number, yMin: number, xMax: number, yMax: number) {
        this.Box = { xMin, yMin, xMax, yMax };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.addEventListener('change', handleFileSelect);
});

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (reader.result instanceof ArrayBuffer) {
                resolve(reader.result);
            } else {
                reject(new Error('Failed to read file as ArrayBuffer.'));
            }
        };

        reader.onerror = () => {
            reject(new Error('Error reading the file.'));
        };

        reader.readAsArrayBuffer(file);
    });
}

async function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;

    if (target.files && target.files.length > 0) {
        const selectedFiles = target.files;

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const arrayBuffer = await readFileAsArrayBuffer(file);
            const view = new DataView(arrayBuffer);
            const header: ShapeFileHeader = readShapefileHeader(view);

            switch (header.shapeType) {
                case 1:
                    PointGeometryRenderWebPage(
                        header,
                        calculateCoordinates(arrayBuffer)
                    );
                    break;
                case 3:
                    PolylineGeometryRenderWebPage(
                        header,
                        calculatePolylineData(arrayBuffer)
                    );
                    break;
            }
        }
    }
}

function readBoundingBox(view: DataView): BoundingBox {
    const boundingBox: BoundingBox = {
        xMin: view.getFloat64(36, true),
        yMin: view.getFloat64(44, true),
        xMax: view.getFloat64(52, true),
        yMax: view.getFloat64(60, true)
    };

    return boundingBox;
}

function readShapefileHeader(view: DataView): ShapeFileHeader {
    const header: ShapeFileHeader = {
        fileCode: view.getInt32(0),
        fileLength: view.getInt32(24),
        version: view.getInt32(28, true),
        shapeType: view.getInt32(32, true),
        boundingBox: readBoundingBox(view)
    };

    return header;
}

function calculateCoordinates(arrayBuffer: ArrayBuffer) {
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

function calculatePolylineData(arrayBuffer: ArrayBuffer): Polyline {
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
        let xyArr: { x: number; y: number }[] = [];

        for (let i = 0; i < polyline.NumPoints; i++) {
            const x = geometryView.getFloat64(xIndex, true);
            const y = geometryView.getFloat64(yIndex, true);
            xIndex += 16;
            yIndex += 16;
            xyArr.push({ x, y });
            polyline.Points.push(xyArr);
        }

        offset += 8 + contentLength * 2;
    }

    console.log('polyline:', polyline);

    return polyline;
}

function PointGeometryRenderWebPage(
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

function PolylineGeometryRenderWebPage(
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

    // polylineData.Parts.forEach(() => {
    //     ctx.beginPath();

    polylineData.Points.forEach(points => {
        ctx.beginPath();

        points.forEach((item, idx) => {
            const x = item.x;
            const y = item.y;

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
    // });
}
