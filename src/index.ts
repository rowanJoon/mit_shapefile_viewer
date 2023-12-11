import * as fs from 'fs';

interface BoundingBox {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
}

interface ShapeFileHeader {
    fileCode: number;
    fileLength: number;
    version: number;
    shapeType: number;
    boundingBox: BoundingBox;
}

function readBoundingBox(buffer: Buffer): BoundingBox {
    const boundingBox: BoundingBox = {
        xMin: buffer.readDoubleLE(0),
        yMin: buffer.readDoubleLE(8),
        xMax: buffer.readDoubleLE(16),
        yMax: buffer.readDoubleLE(24)
    };

    return boundingBox;
}

function readShapefileHeader(filePath: string): ShapeFileHeader {
    const buffer: Buffer = fs.readFileSync(filePath);
    const boundingBoxBuffer: Buffer = Buffer.alloc(32);
    buffer.copy(boundingBoxBuffer, 0, 36, 68);

    const header: ShapeFileHeader = {
        fileCode: buffer.readInt32BE(0),
        fileLength: buffer.readInt32LE(24),
        version: buffer.readInt32LE(28),
        shapeType: buffer.readInt32LE(32),
        boundingBox: readBoundingBox(boundingBoxBuffer)
    };

    return header;
}

function validateShapefile(filePath: string): void {
    const header: ShapeFileHeader = readShapefileHeader(filePath);

    if (
        header.fileCode !== 9994 ||
        header.version !== 1000 ||
        header.shapeType < 0 ||
        header.shapeType > 31
    ) {
        console.error('Invalid Shapefile format');
        return;
    }

    console.log('File Code: ', header.fileCode);
    console.log('File Length: ', header.fileLength);
    console.log('Version: ', header.version);
    console.log('Shape Type: ', header.shapeType);
    console.log('Bounding Box: ', header.boundingBox);
}

// TODO: html 내 file Reader 로 파일 읽어들여 path 값 추출하여 삽입
const shapefilePath: string = '/Users/t1100423/Downloads/turkey/Hatlar.shp';
validateShapefile(shapefilePath);
