export type Coordinate = {
    x: number;
    y: number;
};

export type BoundingBox = {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
};

export type GeoCanvasInteract = {
    zoom: number;
    panX: number;
    panY: number;
    isDragging: boolean;
    dragStartX: number;
    dragStartY: number;
    cursorX: number;
    cursorY: number;
    canvas: HTMLCanvasElement;
    radius: number;
    lineWidth: number;
};

export interface RecordData {
    [fieldName: string]: string | number;
}
