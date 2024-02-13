import {BoundingBox, GeoCanvasInteract} from '../types';
import {Shape} from "./feature/Shape";
import {ShapeDataLoader} from './loader/ShapeDataLoader';
import {FileChecker} from './util/FileChecker';
import {EventDelegator} from './util/EventDelegator';
import {MouseClickEventHandler} from "./handler/MouseClickEventHandler";
import {MouseDownEventHandler} from './handler/MouseDownEventHandler';
import {MouseMoveEventHandler} from './handler/MouseMoveEventHandler';
import {MouseUpEventHandler} from './handler/MouseUpEventHandler';
import {MouseWheelEventHandler} from './handler/MouseWheelEventHandler';
import {ShapeRender} from "./render/ShapeRender";
import {Layer} from "./render/Layer";
import {DbaseLoader} from "./loader/DbaseDataLoader";
import {Rectangle, QuadTree} from "./util/QuadTree";

class App {
    private shapeRender: ShapeRender | undefined;
    private readonly geoCanvasInteract: GeoCanvasInteract;
    private eventDelegator: EventDelegator;
    private readonly layer: Layer;
    // private quadtree: QuadTree;
    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            const fileInput: HTMLInputElement = document.getElementById('fileInput') as HTMLInputElement;
            fileInput.addEventListener('change', this.handleSelectFiles.bind(this));
        });

        this.geoCanvasInteract = {
            zoom: 1,
            oldZoom: 1,
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
        // const canvasRect = this.geoCanvasInteract.canvas.getBoundingClientRect();
        // const canvasBoundary = new Rectangle(0, 0, canvasRect.width, canvasRect.height);
        // this.quadtree = new QuadTree(canvasBoundary, 4);
    }

    private async handleSelectFiles(event: Event): Promise<void> {
        const target: HTMLInputElement = event.target as HTMLInputElement;
        const checkSelectedFileNameSet = new Set();

        if (target.files && target.files.length > 0) {
            const selectedFiles: FileList = target.files;

            for (let i = 0, len = selectedFiles.length; i < len; i++) {
                const file: File = selectedFiles[i];
                const fileName: string = file.name.split('.')[0];
                const fileExtension: string = file.name.split('.')[1];
                const arrayBuffer: ArrayBuffer = await FileChecker.readFileAsArrayBuffer(file);

                if (!checkSelectedFileNameSet.has(fileName)) {
                    this.createCheckBox(fileName);
                    checkSelectedFileNameSet.add(fileName);
                }

                switch(fileExtension) {
                    case 'shp':
                        this.loadAndRenderShape(arrayBuffer);
                        break;
                    case 'dbf':
                        this.loadDbf(arrayBuffer);
                        break;
                }
            }
        }
    }

    private createCheckBox(fileName: string): void {
        const shapeFileNameField: HTMLDivElement = document.getElementById('filename-chkField') as HTMLDivElement;
        const checkbox: HTMLInputElement = document.createElement('input');
        const label: HTMLLabelElement = document.createElement('label');

        checkbox.type = 'checkbox';
        checkbox.id = fileName;
        checkbox.checked = true;

        label.htmlFor = fileName;
        label.appendChild(document.createTextNode(fileName))

        shapeFileNameField.appendChild(checkbox);
        shapeFileNameField.appendChild(label);
    }

    private loadAndRenderShape(arrayBuffer: ArrayBuffer): void {
        let shape: Shape = this.loadShape(arrayBuffer);

        this.renderShape(shape);
        this.setMouseEvent(shape);
    }

    private loadShape(arrayBuffer: ArrayBuffer): Shape {
        const shapeData: ShapeDataLoader = new ShapeDataLoader(arrayBuffer);
        return shapeData.loadShapeData();
    }

    private renderShape(shape: Shape): void {
        this.shapeRender = new ShapeRender('featureCanvas', shape, this.layer);
        this.shapeRender.render(this.geoCanvasInteract);
    }

    private setMouseEvent(shape: Shape): void {
        if (this.eventDelegator.eventListeners.size !== 0) {
            this.removeMouseEventHandler();
        }
        this.addMouseEventHandler(shape);
    }

    private addMouseEventHandler(shape: Shape): void {
        if (this.shapeRender !== undefined) {
            const shapeRender: ShapeRender = this.shapeRender;
            const boundingBox: BoundingBox = shape.shapeHeader.boundingBox;
            const geoCanvasInteract: GeoCanvasInteract = this.geoCanvasInteract;
            const layer: Layer = this.layer;

            const mouseClickEventHandler: MouseClickEventHandler = new MouseClickEventHandler(shapeRender, boundingBox, geoCanvasInteract, layer);
            const mouseDownEventHandler: MouseMoveEventHandler = new MouseDownEventHandler(shapeRender, boundingBox, geoCanvasInteract, layer);
            const mouseMoveEventHandler: MouseMoveEventHandler = new MouseMoveEventHandler(shapeRender, boundingBox, geoCanvasInteract, layer);
            const mouseUpEventHandler: MouseMoveEventHandler = new MouseUpEventHandler(shapeRender, boundingBox, geoCanvasInteract, layer);
            const mouseWheelEventHandler: MouseMoveEventHandler = new MouseWheelEventHandler(shapeRender, boundingBox, geoCanvasInteract, layer);

            this.eventDelegator.addEventListener('click', mouseClickEventHandler);
            this.eventDelegator.addEventListener('mousedown', mouseDownEventHandler);
            this.eventDelegator.addEventListener('mousemove', mouseMoveEventHandler);
            this.eventDelegator.addEventListener('mouseup', mouseUpEventHandler);
            this.eventDelegator.addEventListener('wheel', mouseWheelEventHandler);
        }
    }

    private removeMouseEventHandler(): void {
        this.eventDelegator.removeAllEventListeners();
    }

    private loadDbf(arrayBuffer: ArrayBuffer): void {
        const dbaseLoader = new DbaseLoader(arrayBuffer);
        const recordsArray = dbaseLoader.readRecords();
        this.layer.addLayerData(recordsArray);
    }
}

new App();
