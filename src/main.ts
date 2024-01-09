import { FileReaderPromise } from './util/FileReader.js';
import { ShapeFileReader } from './util/ReadShapefile.js';
import { CoordsCalculator } from './util/CalculateCoords.js';

// import { pointGeometryRenderWebPage } from './feature/point/Point.js';
// import { polylineGeometryRenderWebPage } from './feature/polyline/polyline.js';
// import { polygonGeometryRenderWebPage } from './feature/polygon/polygon.js';

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

        if (target.files && target.files.length > 0) {
            const selectedFiles: FileList = target.files;

            for (let i = 0; i < selectedFiles.length; i++) {
                const file: File = selectedFiles[i];
                const arrayBuffer: ArrayBuffer =
                    await FileReaderPromise.readFileAsArrayBuffer(file);
                const view: DataView = new DataView(arrayBuffer);
                const header = ShapeFileReader.getHeader(view);

                const pointDataCalculator: CoordsCalculator =
                    new CoordsCalculator(arrayBuffer);
                const feature = pointDataCalculator.calculateData(
                    header.shapeType
                );

                console.log('Feature Data: ', feature);
            }
        }
    }
}

const main = new Main();
