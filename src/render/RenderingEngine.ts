export class RenderingEngine {
    public canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D | null;

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d');

        if (!this.ctx) {
            console.error('Unable to get 2D context!');
        }
    }

    beginPath(): void {
        if (this.ctx) {
            this.ctx.beginPath();
        }
    }

    closePath(): void {
        if (this.ctx) {
            this.ctx.closePath();
        }
    }

    stroke(): void {
        if (this.ctx) {
            this.ctx.stroke();
        }
    }

    fill(): void {
        if (this.ctx) {
            this.ctx.fill();
        }
    }

    fillColor(color: string): void {
        if (this.ctx) {
            this.ctx.fillStyle = color;
        }
    }

    clearCanvas(): void {
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    translate(panX: number, panY: number): void {
        if (this.ctx) {
            this.ctx.translate(panX, panY);
        }
    }

    scale(minZoom: number, maxZoom: number): void {
        if (this.ctx) {
            this.ctx.scale(minZoom, maxZoom);
        }
    }

    saveContext(): void {
        if (this.ctx) {
            this.ctx.save();
        }
    }

    restoreContext(): void {
        if (this.ctx) {
            this.ctx.restore();
        }
    }

    drawPoint(x: number, y: number): void {
        if (this.ctx) {
            this.beginPath();
            this.ctx.arc(x, y, 2, 0, 2 * Math.PI);
            this.fill();
            this.closePath();
        }
    }

    drawPoly(x: number, y: number, idx: number): void {
        if (this.ctx) {
            if (idx === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
    }
}
