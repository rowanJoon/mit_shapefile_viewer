import {GeoCanvasInteract} from '../types';
import {Shape} from "./feature/Shape";
import {ShapeDataLoader} from './loader/ShapeDataLoader';
import {FileChecker} from './util/FileChecker';
import {EventDelegator} from './util/EventDelegator';
import {ShapeRender} from "./render/ShapeRender";
import {Layer} from "./feature/Layer";
import {DbaseLoader} from "./loader/DbaseDataLoader";

class App {
    private shapeRender: ShapeRender | undefined;
    private readonly geoCanvasInteract: GeoCanvasInteract;
    private readonly eventDelegator: EventDelegator;
    private readonly layer: Layer;

    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            const fileInput: HTMLInputElement = document.getElementById('fileInput') as HTMLInputElement;
            fileInput.addEventListener('change', this.handleSelectFiles.bind(this));
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
            mouseX: 0,
            mouseY: 0,
            canvasX: 0,
            canvasY: 0,
            canvas: document.getElementById('featureCanvas') as HTMLCanvasElement,
            radius: 2,
            lineWidth: 1
        };
        this.eventDelegator = new EventDelegator(this.geoCanvasInteract.canvas);
        this.layer = new Layer();
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
                    this._createCheckBox(fileName);
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

    private _createCheckBox(fileName: string): void {
        const shapeFileNameField: HTMLDivElement = document.getElementById('filename-chkField') as HTMLDivElement;
        const checkbox: HTMLInputElement = document.createElement('input');
        const label: HTMLLabelElement = document.createElement('label');

        checkbox.type = 'checkbox';
        checkbox.id = fileName;
        checkbox.checked = true;

        label.htmlFor = fileName;
        label.appendChild(document.createTextNode(fileName));

        shapeFileNameField.appendChild(checkbox);
        shapeFileNameField.appendChild(label);
    }

    private loadAndRenderShape(arrayBuffer: ArrayBuffer): void {
        let shape: Shape = this.loadShape(arrayBuffer);
        this.renderShape(shape);
    }

    private loadShape(arrayBuffer: ArrayBuffer): Shape {
        const shapeData: ShapeDataLoader = new ShapeDataLoader(arrayBuffer);
        return shapeData.loadShapeData();
    }

    private renderShape(shape: Shape): void {
        this.shapeRender = new ShapeRender('featureCanvas', shape, this.layer, this.eventDelegator);
        this.shapeRender.render(this.geoCanvasInteract);
    }

    private loadDbf(arrayBuffer: ArrayBuffer): void {
        const dbaseLoader = new DbaseLoader(arrayBuffer);
        const recordsArray = dbaseLoader.readRecords();
        this.layer.addLayerData(recordsArray);
    }
}

new App();
