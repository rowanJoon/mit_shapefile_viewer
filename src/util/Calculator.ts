import {Layer} from "../render/Layer";
import {BoundingBox, Coordinate} from "../../types";

export class Calculator {
    public calculateLargestBoundingBox(layer: Layer): BoundingBox {
        let largestBoundingBox: BoundingBox | null = null;

        for (let i = 0; i < layer.getLayer().length; i++) {
            const boundingBox: BoundingBox = layer.getLayer()[i].shapeHeader.boundingBox;

            if (largestBoundingBox === null) {
                largestBoundingBox = boundingBox;
            } else {
                largestBoundingBox = {
                    xMin: Math.min(largestBoundingBox.xMin, boundingBox.xMin),
                    yMin: Math.min(largestBoundingBox.yMin, boundingBox.yMin),
                    xMax: Math.max(largestBoundingBox.xMax, boundingBox.xMax),
                    yMax: Math.max(largestBoundingBox.yMax, boundingBox.yMax)
                };
            }
        }

        if (largestBoundingBox === null) {
            return { xMin: 0, yMin: 0, xMax: 0, yMax: 0 };
        }

        return largestBoundingBox;
    }

    public calculateRealCoordToCanvasCoord(canvas: HTMLCanvasElement, coordinate: Coordinate, boundingBox: BoundingBox): Coordinate {
        const x: number = ((coordinate.x - boundingBox.xMin) / (boundingBox.xMax - boundingBox.xMin)) * canvas.width;
        const y: number = canvas.height - ((coordinate.y - boundingBox.yMin) / (boundingBox.yMax - boundingBox.yMin)) * canvas.height;

        return { x, y }
    }

    // public calculateCanvasCoordToRealCoord(canvas: HTMLCanvasElement, canvasCoordinate: Coordinate, boundingBox: BoundingBox): Coordinate {
    //     const x: number = (canvasCoordinate.x / canvas.width) * (boundingBox.xMax - boundingBox.xMin) + boundingBox.xMin;
    //     const y: number = ((canvas.height - canvasCoordinate.y) / canvas.height) * (boundingBox.yMax - boundingBox.yMin) + boundingBox.yMin;
    //
    //     return {
    //         x: Number(x.toFixed(5)),
    //         y: Number(y.toFixed(5))
    //     };
    // }

    public areNumberIsEqual(num1: number, num2: number): boolean {
        const epsilon = 1e-15;
        return Math.abs(num1 - num2) < epsilon;
    }

    public areArrayIsEqual(realCoordinateArray: Coordinate[], linearCoordinateArray: Coordinate[] | null): boolean {
        if (linearCoordinateArray === null) {
            return false;
        }

        const linearArray: Coordinate[] = Array.isArray(linearCoordinateArray) ? linearCoordinateArray : [linearCoordinateArray];

        if (realCoordinateArray.length !== linearArray.length) {
            return false;
        }

        for (let i = 0; i < realCoordinateArray.length; i++) {
            const realCoordinate: Coordinate = realCoordinateArray[i];
            const linearCoordinate: Coordinate = linearArray[i];

            if (!this.areNumberIsEqual(realCoordinate.x, linearCoordinate.x) || !this.areNumberIsEqual(realCoordinate.y, linearCoordinate.y)) {
                return false;
            }
        }

        return true;
    }
}