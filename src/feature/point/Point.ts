export type Coordinate = {
    x: number;
    y: number;
};

export class Point {
    shapeType: number = 0;
    coordinate?: Coordinate[];

    constructor(shapeType: number, coordinate?: Coordinate[]) {
        this.shapeType = shapeType;
        this.coordinate = coordinate;
    }
    // static renderWebPage() {
    //     const canvas = document.querySelector(
    //         '#featureCanvas'
    //     ) as HTMLCanvasElement;
    //     const ctx = canvas.getContext('2d');

    //     if (!ctx) {
    //         console.error('Unable to get 2D context');
    //         return;
    //     }

    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
    //     ctx.save();

    //     for (const coord of coordinates) {
    //         const x: number = coord.x;
    //         const y: number = coord.y;

    //         if (x !== undefined && y !== undefined) {
    //             // const renderX: number =
    //             //     ((x - header.boundingBox.xMin) /
    //             //         (header.boundingBox.xMax - header.boundingBox.xMin)) *
    //             //     canvas.width;
    //             // const renderY: number =
    //             //     canvas.height -
    //             //     ((y - header.boundingBox.yMin) /
    //             //         (header.boundingBox.yMax - header.boundingBox.yMin)) *
    //             //         canvas.height;

    //             // ctx.beginPath();
    //             // ctx.arc(renderX, renderY, 2, 0, 2 * Math.PI);
    //             ctx.fill();
    //             ctx.closePath();
    //         }
    //     }

    //     ctx.restore();
    // }
}
