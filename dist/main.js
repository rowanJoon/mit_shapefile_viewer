var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { calculatePointData, PointGeometryRenderWebPage } from './point.js';
import { calculatePolylineData, PolylineGeometryRenderWebPage } from './polyline.js';
import { calculatePolygonData, PolygonGeometryRenderWebPage } from './polygon.js';
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', handleFileSelect);
});
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result instanceof ArrayBuffer) {
                resolve(reader.result);
            }
            else {
                reject(new Error('Failed to read file as ArrayBuffer.'));
            }
        };
        reader.onerror = () => {
            reject(new Error('Error reading the file.'));
        };
        reader.readAsArrayBuffer(file);
    });
}
function handleFileSelect(event) {
    return __awaiter(this, void 0, void 0, function* () {
        const target = event.target;
        const fileNameInputElements = document.querySelectorAll('#pointFileNameField, #polylineFileNameField');
        const inputArray = Array.from(fileNameInputElements);
        if (target.files && target.files.length > 0) {
            const selectedFiles = target.files;
            const fileName = selectedFiles[0].name;
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                const arrayBuffer = yield readFileAsArrayBuffer(file);
                const view = new DataView(arrayBuffer);
                const header = readShapefileHeader(view);
                switch (header.shapeType) {
                    case 1:
                        PointGeometryRenderWebPage(header, calculatePointData(arrayBuffer));
                        break;
                    case 3:
                        PolylineGeometryRenderWebPage(header, calculatePolylineData(arrayBuffer));
                        inputArray[1].innerText = fileName;
                        break;
                    case 5:
                        PolygonGeometryRenderWebPage(header, calculatePolygonData(arrayBuffer));
                        break;
                }
            }
        }
    });
}
function readBoundingBox(view) {
    const boundingBox = {
        xMin: view.getFloat64(36, true),
        yMin: view.getFloat64(44, true),
        xMax: view.getFloat64(52, true),
        yMax: view.getFloat64(60, true)
    };
    return boundingBox;
}
function readShapefileHeader(view) {
    const header = {
        fileCode: view.getInt32(0),
        fileLength: view.getInt32(24),
        version: view.getInt32(28, true),
        shapeType: view.getInt32(32, true),
        boundingBox: readBoundingBox(view)
    };
    return header;
}
