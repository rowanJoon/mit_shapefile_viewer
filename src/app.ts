import {GeoCanvasInteract, ShapeHeader} from './type/Type.js';
import {DataLoader} from './DataLoader.js';
import {ShapeFileReader} from './ShapefileReader.js';
import {Point} from './feature/Point.js';
import {Poly} from './feature/Poly.js';
import {FileReaderPromise} from './util/FileReader.js';
import {EventDelegator} from './util/EventDelegator.js';
import {MouseWheelEventHandler} from './handler/MouseWheelEventHandler.js';
import {MouseDownEventHandler} from './handler/MouseDownEventHandler.js';
import {MouseUpEventHandler} from './handler/MouseUpEventHandler.js';
import {MouseMoveEventHandler} from './handler/MouseMoveEventHandler.js';
import {ShapeRender} from "./render/ShapeRender.js";
import {Layer} from "./render/Layer.js";

class App {
    private shapeRender: ShapeRender | undefined;
    private readonly geoCanvasInteract: GeoCanvasInteract;
    private eventDelegator: EventDelegator;
    private layer: Layer;
    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            const fileInput = document.getElementById('fileInput') as HTMLInputElement;
            fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        });

        this.geoCanvasInteract = {
            zoom: 1,
            panX: 0,
            panY: 0,
            isDragging: false,
            dragStartX: 0,
            dragStartY: 0,
            cursorX: 0,
            cursorY: 0,
            canvas: document.getElementById('featureCanvas') as HTMLCanvasElement,
            radius: 2,
            lineWidth: 1
        };

        this.eventDelegator = new EventDelegator(this.geoCanvasInteract.canvas);
        this.layer = new Layer();
    }

    private async handleFileSelect(event: Event): Promise<void> {
        const target: HTMLInputElement = event.target as HTMLInputElement;

        if (target.files && target.files.length > 0) {
            const selectedFiles: FileList = target.files;

            for (let i = 0; i < selectedFiles.length; i++) {
                const file: File = selectedFiles[i];
                const arrayBuffer: ArrayBuffer = await FileReaderPromise.readFileAsArrayBuffer(file);
                this.loadAndDrawShape(arrayBuffer);
            }
        }
    }

    private loadAndDrawShape(arrayBuffer: ArrayBuffer): void {
        const view: DataView = new DataView(arrayBuffer);
        const header: ShapeHeader = ShapeFileReader.getHeader(view);
        let shape: Point | Poly;

        if (header.shapeType === 1) {
            shape = this.loadPoint(arrayBuffer, header);
            this.renderShape(shape);
        } else if (header.shapeType === 3 || header.shapeType === 5) {
            shape = this.loadPoly(arrayBuffer, header);
            this.renderShape(shape);
        } else {
            console.error('Cannot Read ShapeType!');
        }

        this.setMouseEvent();
    }

    private loadPoint(arrayBuffer: ArrayBuffer, header: ShapeHeader): Point {
        const pointData: DataLoader = new DataLoader(arrayBuffer);
        return pointData.loadPointData(header, 100);
    }

    private loadPoly(arrayBuffer: ArrayBuffer, header: ShapeHeader): Poly {
        const polyData: DataLoader = new DataLoader(arrayBuffer);
        return polyData.loadPolyData(header, 100);
    }

    private renderShape(shape: Point | Poly): void {
        this.shapeRender = new ShapeRender('featureCanvas', shape, this.layer);
        this.shapeRender.render(this.geoCanvasInteract);
    }

    private setMouseEvent(): void {
        if (this.eventDelegator.eventListeners.size !== 0) {
            this.removeMouseEventHandler();
        }
        this.addMouseEventHandler();
    }

    private addMouseEventHandler(): void {
        if (this.shapeRender !== undefined) {
            const mouseWheelEventHandler: MouseMoveEventHandler = new MouseWheelEventHandler(this.shapeRender, this.geoCanvasInteract);
            const mouseDownEventHandler: MouseMoveEventHandler = new MouseDownEventHandler(this.shapeRender, this.geoCanvasInteract);
            const mouseMoveEventHandler: MouseMoveEventHandler = new MouseMoveEventHandler(this.shapeRender, this.geoCanvasInteract);
            const mouseUpEventHandler: MouseMoveEventHandler = new MouseUpEventHandler(this.shapeRender, this.geoCanvasInteract);

            this.eventDelegator.addEventListener('wheel', mouseWheelEventHandler);
            this.eventDelegator.addEventListener('mousedown', mouseDownEventHandler);
            this.eventDelegator.addEventListener('mousemove', mouseMoveEventHandler);
            this.eventDelegator.addEventListener('mouseup', mouseUpEventHandler);
        }
    }

    private removeMouseEventHandler(): void {
        this.eventDelegator.removeAllEventListeners();
    }
}

const app: App = new App();
