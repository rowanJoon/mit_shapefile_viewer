// import { ShapeFileHeader } from '../../main.js';
// import { Feature } from '../../util/CalculateCoords.js';

// export function polygonGeometryRenderWebPage(
//     header: ShapeFileHeader,
//     polygonData: Feature
// ): void {
//     console.log(polygonData);
//     const canvas = document.querySelector(
//         '#polygonCanvas'
//     ) as HTMLCanvasElement;
//     const ctx = canvas.getContext('2d');

//     if (!ctx) {
//         console.error('Unable to get 2D context');
//         return;
//     }

//     polygonData.FeatureCoordinates.forEach(coords => {
//         ctx.beginPath();

//         coords.forEach((coord, idx) => {
//             const x: number = coord.x;
//             const y: number = coord.y;

//             if (x !== undefined && y !== undefined) {
//                 const renderX: number =
//                     ((x - header.boundingBox.xMin) /
//                         (header.boundingBox.xMax - header.boundingBox.xMin)) *
//                     canvas.width;
//                 const renderY: number =
//                     canvas.height -
//                     ((y - header.boundingBox.yMin) /
//                         (header.boundingBox.yMax - header.boundingBox.yMin)) *
//                         canvas.height;

//                 if (idx === 0) {
//                     ctx.moveTo(renderX, renderY);
//                 } else {
//                     ctx.lineTo(renderX, renderY);
//                 }
//             }
//         });

//         ctx.fillStyle = 'green';
//         ctx.fill();
//         ctx.stroke();
//     });
// }
