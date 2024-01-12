import { FileReaderPromise } from './util/FileReader.js';
import { ShapeFileReader } from './util/ReadShapefile.js';

import { Point } from './feature/Point.js';
import { Poly } from './feature/Poly.js';

import { DataLoader } from './DataLoader.js';
import { DrawingPoint, DrawingPoly } from './DrawingService.js';

class Main {
    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            const fileInput = document.getElementById(
                'fileInput'
            ) as HTMLInputElement;
            fileInput.addEventListener('change', this.handleFileSelect);
        });
    }

    private async handleFileSelect(event: Event) {
        const target = event.target as HTMLInputElement;
        let contentsOffset: number = 100;

        if (target.files && target.files.length > 0) {
            const selectedFiles: FileList = target.files;

            for (let i = 0; i < selectedFiles.length; i++) {
                const file: File = selectedFiles[i];
                const arrayBuffer: ArrayBuffer =
                    await FileReaderPromise.readFileAsArrayBuffer(file);
                const view: DataView = new DataView(arrayBuffer);
                const header = ShapeFileReader.getHeader(view);

                if (header.shapeType === 1) {
                    const pointData: DataLoader = new DataLoader(arrayBuffer);
                    const point: Point = pointData.loadPointData(
                        header,
                        contentsOffset
                    );
                    const pointDraw: DrawingPoint = new DrawingPoint(
                        'featureCanvas',
                        point
                    );

                    pointDraw.draw();
                } else if (header.shapeType === 3 || header.shapeType === 5) {
                    const polyData: DataLoader = new DataLoader(arrayBuffer);
                    const poly: Poly = polyData.loadPolyData(
                        header,
                        contentsOffset
                    );
                    const polyDraw: DrawingPoly = new DrawingPoly(
                        'featureCanvas',
                        poly
                    );

                    polyDraw.draw();
                } else {
                    console.error('Cannot Read ShapeType!');
                }
            }
        }
    }
}

const main = new Main();
