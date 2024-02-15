import {Coordinate} from "../../types";

export class LinearSearch {
    public singleLinearSearch(coordinates: Coordinate[], targetCoordinate: Coordinate): Coordinate | null {
        let minDistance: number = Number.MAX_VALUE;
        let closetCoordinate = null;

        for (let i = 0; i < coordinates.length; i++) {
            const coordinate: Coordinate = coordinates[i];
            const distanceX: number = Math.abs((coordinate.x - targetCoordinate.x));
            const distanceY: number = Math.abs((coordinate.y - targetCoordinate.y));
            const distance: number = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            if (distance < minDistance) {
                minDistance = distance;
                closetCoordinate = coordinate;
            }
        }

        return closetCoordinate;
    }

    public multiLinearSearch(coordinates: Array<Array<Coordinate>>, targetCoordinate: Coordinate): Array<Coordinate> | null {
        let minDistance: number = Number.MAX_VALUE;
        let closetCoordinateArray: Array<Coordinate> | null = null;

        for (let i = 0; i < coordinates.length; i++) {
            const coordinate: Array<Coordinate> = coordinates[i];
            let minDistanceForCoordinate: number = Number.MAX_VALUE;

            for (let j = 0; j < coordinate.length; j++) {
                const distanceX: number = Math.abs(coordinate[j].x - targetCoordinate.x);
                const distanceY: number = Math.abs(coordinate[j].y - targetCoordinate.y);
                const distance: number = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

                if (distance < minDistanceForCoordinate) {
                    minDistanceForCoordinate = distance;
                }
            }

            if (minDistanceForCoordinate < minDistance) {
                minDistance = minDistanceForCoordinate;
                closetCoordinateArray = coordinate;
            }
        }

        return closetCoordinateArray;
    }
}