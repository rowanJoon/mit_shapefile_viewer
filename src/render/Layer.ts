import {Point} from "../feature/Point";
import {Poly} from "../feature/Poly";

export class Layer {
    public geoObjects: (Point | Poly)[] = [];

    addGeoObject(geoObject: Point | Poly): void {
        if (!this.geoObjects.includes(geoObject)) {
            this.geoObjects.push(geoObject);
        }
    }

    sizeGeoObject(): number {
        return this.geoObjects.length;
    }
}