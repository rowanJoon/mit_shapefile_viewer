import { ShapeFileHeader, BoundingBox, Coordinate } from './main';

class Polygon {
    Box: BoundingBox = {} as BoundingBox;
    NumParts: number = 0;
    NumPoints: number = 0;
    Parts: number[] = [];
    PolygonCoordinates: Array<Coordinate>[] = [];

    constructor(xMin?: number, yMin?: number, xMax?: number, yMax?: number) {
        if (
            xMin !== undefined &&
            yMin !== undefined &&
            xMax !== undefined &&
            yMax !== undefined
        ) {
            this.Box = { xMin, yMin, xMax, yMax };
        }
    }
}

export function calculatePolygonData(arrayBuffer: ArrayBuffer): Polygon {
    const polygon = new Polygon();
    console.log(arrayBuffer);

    return polygon;
}

export function PolygonGeometryRenderWebPage(
    header: ShapeFileHeader,
    polygonData: Polygon
): void {
    console.log(header);
}
