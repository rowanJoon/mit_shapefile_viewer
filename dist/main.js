"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Polyline {
    constructor(xMin, yMin, xMax, yMax) {
        this.Box = {};
        this.NumParts = 0;
        this.NumPoints = 0;
        this.Parts = [];
        // Points: { x: number; y: number }[] = [];
        this.Points = [];
        this.Box = { xMin, yMin, xMax, yMax };
    }
}
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
        if (target.files && target.files.length > 0) {
            const selectedFiles = target.files;
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                const arrayBuffer = yield readFileAsArrayBuffer(file);
                const view = new DataView(arrayBuffer);
                const header = readShapefileHeader(view);
                switch (header.shapeType) {
                    case 1:
                        PointGeometryRenderWebPage(header, calculateCoordinates(arrayBuffer));
                        break;
                    case 3:
                        PolylineGeometryRenderWebPage(header, calculatePolylineData(arrayBuffer));
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
function calculateCoordinates(arrayBuffer) {
    const view = new DataView(arrayBuffer);
    const points = [];
    let offset = 100;
    while (offset < arrayBuffer.byteLength) {
        const contentLength = view.getInt32(offset + 4, false);
        const geometryData = arrayBuffer.slice(offset + 8, offset + 8 + contentLength * 2);
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
function calculatePolylineData(arrayBuffer) {
    const view = new DataView(arrayBuffer);
    const polyline = new Polyline(0, 0, 0, 0);
    let offset = 100;
    while (offset < arrayBuffer.byteLength) {
        const contentLength = view.getInt32(offset + 4, false);
        const geometryData = arrayBuffer.slice(offset + 8, offset + 8 + contentLength * 2);
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
        let xyArr = [];
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
function PointGeometryRenderWebPage(header, coordinates) {
    const canvas = document.querySelector('#pointCanvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Unable to get 2D context');
        return;
    }
    for (const coord of coordinates) {
        const x = coord.x;
        const y = coord.y;
        if (x !== undefined && y !== undefined) {
            const renderX = ((x - header.boundingBox.xMin) /
                (header.boundingBox.xMax - header.boundingBox.xMin)) *
                canvas.width;
            const renderY = canvas.height -
                ((y - header.boundingBox.yMin) /
                    (header.boundingBox.yMax - header.boundingBox.yMin)) *
                    canvas.height;
            ctx.beginPath();
            ctx.arc(renderX, renderY, 2, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}
function PolylineGeometryRenderWebPage(header, polylineData) {
    const canvas = document.querySelector('#polylineCanvas');
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
                const renderX = ((x - header.boundingBox.xMin) /
                    (header.boundingBox.xMax - header.boundingBox.xMin)) *
                    canvas.width;
                const renderY = canvas.height -
                    ((y - header.boundingBox.yMin) /
                        (header.boundingBox.yMax - header.boundingBox.yMin)) *
                        canvas.height;
                if (idx === 0) {
                    ctx.moveTo(renderX, renderY);
                }
                else {
                    ctx.lineTo(renderX, renderY);
                }
            }
        });
        ctx.stroke();
    });
    // });
}
