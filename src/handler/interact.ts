// import { ShapeFileHeader } from '../main.js';
// import { updatePointGeometryRenderWebPage } from '../feature/point/point.js';

// export function mapPanning(
//     header: ShapeFileHeader,
//     canvas: HTMLCanvasElement,
//     coordinates: { x: number; y: number }[]
// ): void {
//     addEventMouseWheel(header, canvas, coordinates);
// }

// function addEventMouseWheel(
//     header: ShapeFileHeader,
//     canvas: HTMLCanvasElement,
//     coordinates: { x: number; y: number }[]
// ): void {
//     canvas.addEventListener('wheel', e => {
//         e.preventDefault();

//         // if (e.deltaY < 0) {
//         //     mapInteractor.zoom += 0.01;
//         // } else {
//         //     mapInteractor.zoom -= 0.01;
//         // }

//         // mapInteractor.centerX = canvas.width / 2;
//         // mapInteractor.centerY = canvas.height / 2;
//         // mapInteractor.cursorX = e.clientX - canvas.offsetLeft;
//         // mapInteractor.cursorY = e.clientY - canvas.offsetTop;
//         // mapInteractor.panX =
//         //     canvas.width - mapInteractor.cursorX - mapInteractor.centerX;
//         // mapInteractor.panY =
//         //     canvas.height - mapInteractor.cursorY - mapInteractor.centerY;

//         // switch (header.shapeType) {
//         //     case 1:
//         //         updatePointGeometryRenderWebPage(
//         //             header,
//         //             canvas,
//         //             coordinates,
//         //             mapInteractor
//         //         );
//         //         break;
//         // }
//     });
// }
