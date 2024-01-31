import {GeoCanvasEventHandler} from './GeoCanvasEventHandler.js';
import {Coordinate} from "../type/Type";

export class MouseClickEventHandler extends GeoCanvasEventHandler {
    handleEvent(e: MouseEvent): void {
        const clientX: number = e.clientX;
        const clientY: number = e.clientY;
        const clickCoordinate: Coordinate = {
            x: clientX,
            y: clientY
        };

        console.log('x: ', clientX, ' y: ', clientY);
        console.log(this.shapeRender.extractCoordinates(clickCoordinate, this.boundingBox));
    }
}
