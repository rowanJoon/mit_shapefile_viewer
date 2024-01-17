import { DataLoader } from './DataLoader.js';
import { ShapeFileReader } from './ShapefileReader.js';

import { RenderingPoint } from './render/RenderingPoint.js';
import { RenderingPoly } from './render/RenderingPoly.js';

import { Point } from './feature/Point.js';
import { Poly } from './feature/Poly.js';

import { FileReaderPromise } from './util/FileReader.js';
import { EventDelegator } from './util/EventDelegator.js';
import { MouseWheelEventHandler } from './handler/MouseWheelEventHandler.js';
import { Interactor } from './type/Type.js';
import { MouseDownEventHandler } from './handler/MouseDownEventHandler.js';
import { MouseUpEventHandler } from './handler/MouseUpEventHandler.js';
import { MouseMoveEventHandler } from './handler/MouseMoveEventHandler.js';

class Main {
    private geoData: RenderingPoint | RenderingPoly | undefined;
    private interactor: Interactor;
    private eventDelegator: EventDelegator;

    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            const fileInput = document.getElementById('fileInput') as HTMLInputElement;
            fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        });

        this.interactor = {
            zoom: 1,
            panX: 0,
            panY: 0,
            isDragging: false,
            dragStartX: 0,
            dragStartY: 0,
            cursorX: 0,
            cursorY: 0,
            canvas: document.getElementById('featureCanvas') as HTMLCanvasElement
        };

        this.eventDelegator = new EventDelegator(this.interactor.canvas);
    }

    private async handleFileSelect(event: Event) {
        const target = event.target as HTMLInputElement;

        if (target.files && target.files.length > 0) {
            const selectedFiles: FileList = target.files;

            for (let i = 0; i < selectedFiles.length; i++) {
                const file: File = selectedFiles[i];
                const arrayBuffer: ArrayBuffer = await FileReaderPromise.readFileAsArrayBuffer(file);
                this.loadAndDrawShape(arrayBuffer);
            }
        }
    }

    private loadAndDrawShape(arrayBuffer: ArrayBuffer) {
        const view: DataView = new DataView(arrayBuffer);
        const header = ShapeFileReader.getHeader(view);

        if (header.shapeType === 1) {
            this.loadAndDrawPoint(arrayBuffer, header);
        } else if (header.shapeType === 3 || header.shapeType === 5) {
            this.loadAndDrawPoly(arrayBuffer, header);
        } else {
            console.error('Cannot Read ShapeType!');
        }
    }

    private loadAndDrawPoint(arrayBuffer: ArrayBuffer, header: any) {
        const pointData: DataLoader = new DataLoader(arrayBuffer);
        const point: Point = pointData.loadPointData(header, 100);

        this.geoData = new RenderingPoint('featureCanvas', point);
        this.geoData.draw();
        if (this.eventDelegator.eventListeners.size !== 0) {
            this.unRegistMouseEventHandler();
        }
        this.registMouseEventHandler();
    }

    private loadAndDrawPoly(arrayBuffer: ArrayBuffer, header: any) {
        const polyData: DataLoader = new DataLoader(arrayBuffer);
        const poly: Poly = polyData.loadPolyData(header, 100);

        this.geoData = new RenderingPoly('featureCanvas', poly);
        this.geoData.draw();
        if (this.eventDelegator.eventListeners.size !== 0) {
            this.unRegistMouseEventHandler();
        }
        this.registMouseEventHandler();
    }

    private registMouseEventHandler() {
        if (this.geoData !== undefined) {
            const mouseWheelEventHandler = new MouseWheelEventHandler(this.interactor, this.geoData);
            const mouseDownEventHandler = new MouseDownEventHandler(this.interactor, this.geoData);
            const mouseMoveEventHandler = new MouseMoveEventHandler(this.interactor, this.geoData);
            const mouseUpEventHandler = new MouseUpEventHandler(this.interactor, this.geoData);

            this.eventDelegator.addEventListener('wheel', mouseWheelEventHandler);
            this.eventDelegator.addEventListener('mousedown', mouseDownEventHandler);
            this.eventDelegator.addEventListener('mousemove', mouseMoveEventHandler);
            this.eventDelegator.addEventListener('mouseup', mouseUpEventHandler);
        }
    }

    private unRegistMouseEventHandler() {
        this.eventDelegator.removeAllEventListeners();
    }
}

const main = new Main();
