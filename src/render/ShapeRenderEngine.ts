export class ShapeRenderEngine {
    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

        if (!this.ctx) {
            console.error('Unable to get 2D context!');
        }
    }

    public setBeginPath(): void {
        this.ctx.beginPath();
    }

    public setClosePath(): void {
        this.ctx.closePath();
    }

    public setArc(x: number, y: number, radius: number, startAngle: number, endAngle: number): void {
        this.ctx.arc(x, y, radius, startAngle, endAngle);
    }

    public setMoveTo(x: number, y: number): void {
        this.ctx.moveTo(x, y);
    }

    public setLineTo(x: number, y: number): void {
        this.ctx.lineTo(x, y);
    }

    public setStroke(): void {
        this.ctx.stroke();
    }

    public setFill(): void {
        this.ctx.fill();
    }

    public setFillColor(color: string): void {
        this.ctx.fillStyle = color;
    }

    public setStrokeColor(color: string): void {
        this.ctx.strokeStyle = color;
    }

    public setLineWidth(lineWidth: number): void {
        this.ctx.lineWidth = lineWidth;
    }

    public setClearRect(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public setTranslate(panX: number, panY: number): void {
        this.ctx.translate(panX, panY);
    }

    public setScale(minZoom: number, maxZoom: number): void {
        this.ctx.scale(minZoom, maxZoom);
    }

    public setSave(): void {
        this.ctx.save();
    }

    public setRestore(): void {
        this.ctx.restore();
    }
}
