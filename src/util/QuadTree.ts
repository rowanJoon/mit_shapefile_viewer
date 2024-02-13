import {Coordinate, GeoCanvasInteract} from "../../types";

export class Rectangle {
    public x: number;
    public y: number;
    public width: number;
    public height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    public contains(point: Coordinate): boolean {
        return (
            point.x >= this.x - this.width &&
            point.x <= this.x + this.width &&
            point.y >= this.y - this.height &&
            point.y <= this.y + this.height
        );
    }

    public intersects(range: Rectangle): boolean {
        return !(
            range.x - range.width > this.x + this.width ||
            range.x + range.width < this.x - this.width ||
            range.y - range.height > this.y + this.height ||
            range.y + range.height < this.y - this.height
        );
    }

    static createFromClickPoint(clickPoint: Coordinate, size: number): Rectangle {
        const halfSize: number = size / 2;
        return new Rectangle(clickPoint.x - halfSize, clickPoint.y - halfSize, size, size);
    }
}

export class QuadTree {
    private boundary: Rectangle;
    private readonly capacity: number;
    private readonly points: Coordinate[];
    private divided: boolean;
    private northeast: QuadTree | null;
    private northwest: QuadTree | null;
    private southeast: QuadTree | null;
    private southwest: QuadTree | null;

    constructor(boundary: Rectangle, capacity: number) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.points = [];
        this.divided = false;
        this.northeast = null;
        this.northwest = null;
        this.southeast = null;
        this.southwest = null;
    }

    private _subdivide(): void {
        const x: number = this.boundary.x;
        const y: number = this.boundary.y;
        const width: number = this.boundary.width;
        const height: number = this.boundary.height;

        const ne: Rectangle = new Rectangle(x + width / 2, y - height / 2, width / 2, height / 2);
        const nw: Rectangle = new Rectangle(x - width / 2, y - height / 2, width / 2, height / 2);
        const se: Rectangle = new Rectangle(x + width / 2, y + height / 2, width / 2, height / 2);
        const sw: Rectangle = new Rectangle(x - width / 2, y + height / 2, width / 2, height / 2);

        this.northeast = new QuadTree(ne, this.capacity);
        this.northwest = new QuadTree(nw, this.capacity);
        this.southeast = new QuadTree(sw, this.capacity);
        this.southwest = new QuadTree(se, this.capacity);

        this.divided = true;
    }

    public insert(point: Coordinate): boolean | undefined {
        if (!this.boundary.contains(point)) {
            return false;
        }

        if (this.points.length < this.capacity) {
            this.points.push(point);
            return true;
        } else {
            if (!this.divided) {
                this._subdivide();
            }

            if (this.northeast?.insert(point)) {
                return true;
            } else if (this.northwest?.insert(point)) {
                return true;
            } else if (this.southeast?.insert(point)) {
                return true;
            } else if (this.southwest?.insert(point)) {
                return true;
            }
        }
    }

    public query(range: Rectangle, found: Coordinate[]): Coordinate[] {
        if (!this.boundary.intersects(range)) {
            return found;
        } else {
            for (let point of this.points) {
                if (range.contains(point)) {
                    found.push(point);
                }
            }
        }

        if (this.divided) {
            this.northwest?.query(range, found);
            this.northeast?.query(range, found);
            this.southwest?.query(range, found);
            this.southeast?.query(range, found);
        }

        return found;
    }

    public show(geoCanvasInteract: GeoCanvasInteract): void {
        const ctx: CanvasRenderingContext2D | null = geoCanvasInteract.canvas.getContext('2d');
        if (ctx) {
            ctx.strokeStyle = 'black';
            ctx.rect(this.boundary.x, this.boundary.y, this.boundary.width * 2, this.boundary.height * 2);
            ctx.stroke();
        }

        if (this.divided) {
            this.northeast?.show(geoCanvasInteract);
            this.northwest?.show(geoCanvasInteract);
            this.southeast?.show(geoCanvasInteract);
            this.southwest?.show(geoCanvasInteract);
        }
    }

    public queryClosest(point: Coordinate): Coordinate | null {
        let closest: Coordinate | null = null;
        let closestDist: number = Infinity;

        for (const p of this.points) {
            const dist: number = Math.sqrt(Math.pow(point.x - p.x, 2) + Math.pow(point.y - p.y, 2));

            if (dist < closestDist) {
                closest = p;
                closestDist = dist;
            }
        }

        if (this.divided) {
            const children: (QuadTree | null)[] = [this.northeast, this.northwest, this.southeast, this.southwest];

            for (const child of children) {
                if (child) {
                    const childClosest: Coordinate | null = child.queryClosest(point);

                    if (childClosest) {
                        const dist: number = Math.sqrt(Math.pow(point.x - childClosest.x, 2) + Math.pow(point.y - childClosest.y, 2));

                        if (dist < closestDist) {
                            closest = childClosest;
                            closestDist = dist;
                        }
                    }
                }
            }
        }

        return closest;
    }
}
