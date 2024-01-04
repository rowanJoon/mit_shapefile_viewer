import {
    calculatePointData,
    pointGeometryRenderWebPage
} from './feature/point.js';
import { calculateFeatureData } from './feature/feature.js';
import { polylineGeometryRenderWebPage } from './feature/polyline/polyline.js';
import { polygonGeometryRenderWebPage } from './feature/polygon/polygon.js';

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

export class MapInteractor {
    zoom: number = 1;
    centerX: number = 0;
    centerY: number = 0;
    cursorX: number = 0;
    cursorY: number = 0;
    panX: number = 0;
    panY: number = 0;
}

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.addEventListener('change', handleFileSelect);
});

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader: FileReader = new FileReader();

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
    const canvasElements = document.querySelectorAll<HTMLCanvasElement>(
        '#pointCanvas, #polylineCanvas, #polygonCanvas'
    );
    const canvasArray: HTMLCanvasElement[] = Array.from(canvasElements);
    const mapInteractor = new MapInteractor();

    if (target.files && target.files.length > 0) {
        const selectedFiles: FileList = target.files;

        for (let i = 0; i < selectedFiles.length; i++) {
            const file: File = selectedFiles[i];
            const arrayBuffer: ArrayBuffer = await readFileAsArrayBuffer(file);
            const view: DataView = new DataView(arrayBuffer);
            const header: ShapeFileHeader = readShapefileHeader(view);

            switch (header.shapeType) {
                case 1:
                    pointGeometryRenderWebPage(
                        header,
                        calculatePointData(arrayBuffer),
                        mapInteractor
                    );
                    break;
                case 3:
                    polylineGeometryRenderWebPage(
                        header,
                        calculateFeatureData(arrayBuffer)
                    );
                    break;
                case 5:
                    polygonGeometryRenderWebPage(
                        header,
                        calculateFeatureData(arrayBuffer)
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
