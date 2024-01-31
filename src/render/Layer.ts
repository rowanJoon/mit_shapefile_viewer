import {Point} from "../feature/Point";
import {Poly} from "../feature/Poly";
import {RecordData} from "../type/Type.js";

export class Layer {
    public geoObjects: (Point | Poly)[] = [];
    public geoData: Array<any> = [];
    addGeoObject(geoObject: Point | Poly): void {
        if (!this.geoObjects.includes(geoObject)) {
            this.geoObjects.push(geoObject);
        }
    }

    addGeoData(geoData: RecordData[]) {
        this.geoData.push(geoData);
    }

    getGeoObject(): (Point | Poly)[] {
        return this.geoObjects;
    }

    getGeoData(): RecordData[] {
        return this.geoData;
    }

    sizeGeoObject(): number {
        return this.geoObjects.length;
    }
}