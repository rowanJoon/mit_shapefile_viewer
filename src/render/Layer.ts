import {Point} from "../feature/Point";
import {Poly} from "../feature/Poly";

export class Layer {
    private geoObjects: (Point | Poly)[] = [];

    addGeoObject(geoObject: Point | Poly) {
        this.geoObjects.push(geoObject);
    }
}