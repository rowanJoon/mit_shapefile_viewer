import {RecordData} from '../types';

interface DbaseRecordHeader {
    version: number;
    lastUpdateDate: string;
    recordCount: number;
    headerLength: number;
    recordLength: number;
}

interface DbaseFieldDescriptor {
    name: string;
    type: string;
    length: number;
    decimalCount: number;
}

export class DbaseLoader {
    private readonly arrayBuffer: ArrayBuffer;
    private readonly dbfUint8Array: Uint8Array;
    private readonly view: DataView;

    constructor(arrayBuffer: ArrayBuffer) {
        this.arrayBuffer = arrayBuffer;
        this.dbfUint8Array = new Uint8Array(this.arrayBuffer);
        this.view = new DataView(this.dbfUint8Array.buffer);
    }

    private _dbaseRecordHeader(): DbaseRecordHeader {
        const view: DataView = this.view;
        const version: number = view.getUint8(0);
        const year: number = view.getUint8(1) + 1900;
        const month: number = view.getUint8(2);
        const day: number = view.getUint8(3);
        const lastUpdateDate: string = year + '-' + month + '-' + day;
        const recordCount: number = this.view.getInt32(4, true);
        const headerLength: number = this.view.getInt16(8, true);
        const recordLength: number = this.view.getInt16(10, true);
        const recordHeader: DbaseRecordHeader = {
            version: version,
            lastUpdateDate: lastUpdateDate,
            recordCount: recordCount,
            headerLength: headerLength,
            recordLength: recordLength
        };

        console.log('record header : ', recordHeader);

        return recordHeader;
    }

    private _dbaseFieldDescriptor(): DbaseFieldDescriptor[] {
        const fieldDescriptorsArray: DbaseFieldDescriptor[] = [];
        const dbfArray: Uint8Array = this.dbfUint8Array;
        let offset: number = 32;

        while (dbfArray[offset] !== 0x0D) {
            const nameBytes: Uint8Array = dbfArray.subarray(offset, offset + 10);
            const typeByte: string = String.fromCharCode(dbfArray[offset + 11]);
            const lengthByte: number = dbfArray[offset + 16];
            const decimalCountByte: number = dbfArray[offset + 17];
            const name: string = Array.from(nameBytes).map(byte => String.fromCharCode(byte)).join('').replace(/\0/g, '');
            const decimalCount: number = decimalCountByte <= 0xFF ? decimalCountByte : 0;
            const field: DbaseFieldDescriptor = {
                name: name,
                type: typeByte,
                length: lengthByte,
                decimalCount: decimalCount
            };

            fieldDescriptorsArray.push(field);
            offset += 32;
        }

        console.log('field descriptors array : ', fieldDescriptorsArray);

        return fieldDescriptorsArray;
    }

    public readRecords(): RecordData[] {
        const recordHeader: DbaseRecordHeader = this._dbaseRecordHeader();
        const fieldDescriptorsArray: DbaseFieldDescriptor[] = this._dbaseFieldDescriptor();
        const headerLength: number = recordHeader.headerLength;
        const recordArray: RecordData[] = [];
        const dbaseArray: Uint8Array = this.dbfUint8Array;
        const dbaseRecordsArray: Uint8Array = dbaseArray.subarray(headerLength, dbaseArray.length);
        let recordOffset: number = 0;

        while (recordOffset < dbaseRecordsArray.length) {
            const recordData: RecordData = {};
            let fieldOffset: number = 1;

            for (const field of fieldDescriptorsArray) {
                const startOffset: number = recordOffset + fieldOffset;
                const endOffset: number = recordOffset + fieldOffset + field.length;
                const fieldValue: Uint8Array = dbaseRecordsArray.subarray(startOffset, endOffset);

                switch (field.type) {
                    case 'C':
                        recordData[field.name] = this.readRecordForString(fieldValue);
                        break;
                    case 'N':
                        recordData[field.name] = Number(this.readRecordForString(fieldValue));
                        break;
                }

                fieldOffset += field.length;
            }

            recordArray.push(recordData);
            recordOffset += fieldOffset;
        }

        console.log('record array : ', recordArray);

        return recordArray;
    }

    readRecordForString(fieldData: Uint8Array): string {
        return Array.from(fieldData).map(byte => String.fromCharCode(byte)).join('').trim();
    }
}