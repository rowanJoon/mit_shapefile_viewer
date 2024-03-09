import {RecordData} from "../loader/DbaseDataLoader";
import {Shape} from "./Shape";

export class Layer {
    public layerShape: (Shape)[] = [];
    public layerData: Array<any> = [];

    public addLayer(shape: Shape): void {
        if (!this.layerShape.includes(shape)) {
            this.layerShape.push(shape);
        }
    }

    public addLayerData(recordDbaseData: RecordData[]): void {
        this.layerData.push(recordDbaseData);
    }

    public getLayer(): (Shape)[] {
        return this.layerShape;
    }

    public getLayerData(): RecordData[] {
        return this.layerData;
    }
}