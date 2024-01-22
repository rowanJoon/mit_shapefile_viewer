// export class DoubleBufferedCanvas {
//     private firstCanvas: HTMLCanvasElement;
//     private secondCanvas: HTMLCanvasElement;
//     private firstContext: CanvasRenderingContext2D;
//     private secondContext: CanvasRenderingContext2D;
//     private currentCanvas: HTMLCanvasElement;
//     private currentContext: CanvasRenderingContext2D;
//
//     constructor(existingCanvasId: string) {
//         this.firstCanvas = document.createElement('canvas');
//         this.secondCanvas = document.createElement('canvas');
//         this.firstCanvas.id = existingCanvasId + "_first";
//         this.secondCanvas.id = existingCanvasId + "_second";
//
//         const existingCanvas = document.getElementById(existingCanvasId) as HTMLCanvasElement;
//         existingCanvas.parentNode?.appendChild(this.firstCanvas);
//         existingCanvas.parentNode?.appendChild(this.secondCanvas);
//
//         this.firstContext = this.firstCanvas.getContext('2d');
//         this.secondContext = this.secondCanvas.getContext('2d');
//
//         this.currentCanvas = this.firstCanvas;
//         this.currentContext = this.firstContext;
//     }
//
//     getCurrentCanvas(): HTMLCanvasElement {
//         return this.currentCanvas;
//     }
//
//     getCurrentContext(): CanvasRenderingContext2D {
//         return this.currentContext;
//     }
//
//     swapBuffers(): void {
//         if (this.currentCanvas === this.firstCanvas) {
//             this.currentCanvas = this.secondCanvas;
//             this.currentContext = this.secondContext;
//         } else {
//             this.currentCanvas = this.firstCanvas;
//             this.currentContext = this.firstContext
//         }
//     }
// }