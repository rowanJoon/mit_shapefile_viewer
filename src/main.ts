import { calculatePointData, PointGeometryRenderWebPage } from './point.js';
import {
    calculatePolylineData,
    PolylineGeometryRenderWebPage
} from './polyline.js';
import {
    calculatePolygonData,
    PolygonGeometryRenderWebPage
} from './polygon.js';

export interface ShapeFileHeader {
    fileCode: number;
    fileLength: number;
    version: number;
    shapeType: number;
    boundingBox: BoundingBox;
}

export interface BoundingBox {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
}

export interface Coordinate {
    x: number;
    y: number;
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
    const fileNameInputElements = document.querySelectorAll<HTMLInputElement>(
        '#pointFileNameField, #polylineFileNameField'
    );
    const inputArray: HTMLInputElement[] = Array.from(fileNameInputElements);

    if (target.files && target.files.length > 0) {
        const selectedFiles = target.files;
        const fileName = selectedFiles[0].name;

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const arrayBuffer = await readFileAsArrayBuffer(file);
            const view = new DataView(arrayBuffer);
            const header: ShapeFileHeader = readShapefileHeader(view);

            switch (header.shapeType) {
                case 1:
                    PointGeometryRenderWebPage(
                        header,
                        calculatePointData(arrayBuffer)
                    );
                    break;
                case 3:
                    PolylineGeometryRenderWebPage(
                        header,
                        calculatePolylineData(arrayBuffer)
                    );
                    inputArray[1].innerText = fileName;
                    break;
                case 5:
                    PolygonGeometryRenderWebPage(
                        header,
                        calculatePolygonData(arrayBuffer)
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
