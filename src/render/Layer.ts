import {Point} from "../feature/Point";
import {Poly} from "../feature/Poly";
import {RecordData} from "../../types";

export class Layer {
    public geoObjects: (Point | Poly)[] = [];
    public geoData: Array<any> = [];
    public addGeoObject(geoObject: Point | Poly): void {
        if (!this.geoObjects.includes(geoObject)) {
            this.geoObjects.push(geoObject);
        }
    }

    public addGeoData(geoData: RecordData[]) {
        this.geoData.push(geoData);
    }

    public getGeoObject(): (Point | Poly)[] {
        return this.geoObjects;
    }

    public getGeoData(): RecordData[] {
        return this.geoData;
    }

    public sizeGeoObject(): number {
        return this.geoObjects.length;
    }
}