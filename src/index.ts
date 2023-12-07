import * as fs from 'fs';

interface BoundingBox {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
}

function readIntLE(buffer: Buffer, offset: number): number {
    return buffer.readUInt32LE(offset);
}

function readDoubleLE(buffer: Buffer, offset: number): number {
    return buffer.readDoubleLE(offset);
}

// TODO: bounding box 변수 offset number 정보 확인 필요
function readBoundingBox(buffer: Buffer): BoundingBox {
    const boundingBox: BoundingBox = {
        xMin: readDoubleLE(buffer, 4),
        yMin: readDoubleLE(buffer, 12),
        xMax: readDoubleLE(buffer, 20),
        yMax: readDoubleLE(buffer, 28)
    };

    return boundingBox;
}

function readShapefile(filePath: string): void {
    const buffer: Buffer = fs.readFileSync(filePath);
    const fileCode: number = readIntLE(buffer, 0);

    // shape file 시작을 나타내는 4byte 정수, 9994 로 시작
    if (fileCode !== 9994) {
        console.error('Invalid Shapefile format');
        return;
    }

    const fileLength: number = readIntLE(buffer, 24); // 파일 길이, 16비트 워드 단위로 나타내는 4byte 정수
    const version: number = buffer.readInt32LE(28); // shape file 의 버전을 나타내는 4byte 정수
    const shapeType: number = buffer.readInt32LE(32); // 공간 데이터 유형, shape file 에 저장된 공간 데이터의 유형을 나타내는 4byte 정수
    const boundingBox: BoundingBox = readBoundingBox(buffer.slice(36, 68)); // 경계 상자, 파일에 포함된 모든 공간 데이터의 범위를 나타내는 정보

    console.log('File Code: ', fileCode);
    console.log('File Length: ', fileLength);
    console.log('Version: ', version);
    console.log('Shape Type: ', shapeType);
    console.log('Bounding Box: ', boundingBox);
}

// TODO: html 내 file Reader 로 파일 읽어들여 path 값 추출하여 삽입
const shapefilePath: string = '';
readShapefile(shapefilePath);
