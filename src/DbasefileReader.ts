interface DbfField {
    name: string;
    type: string;
    length: number;
    decimalCount: number;
}

interface RecordData {
    [fieldName: string]: string | number;
}

export class DbasefileReader {
    private fields: DbfField[] = [];
    private offset: number = 32;
    private readonly arrayBuffer: ArrayBuffer;
    private readonly dbfUint8Array: Uint8Array;

    constructor(arrayBuffer: ArrayBuffer) {
        this.arrayBuffer = arrayBuffer;
        this.dbfUint8Array = new Uint8Array(this.arrayBuffer);
    }
    getHeader(): DbfField[] {
        const dbfArray: Uint8Array = this.dbfUint8Array;
        let offset: number = this.offset;

        while (dbfArray[offset] !== 0x0D) {
            const nameBytes: Uint8Array = dbfArray.subarray(offset, offset + 10);
            const name: string = Array.from(nameBytes).map(byte => String.fromCharCode(byte)).join('').replace(/\0/g, '');
            const typeByte: string = String.fromCharCode(dbfArray[offset + 11]);
            const lengthByte: number = dbfArray[offset + 16];
            const decimalCountByte: number = dbfArray[offset + 17];
            const decimalCount: number = decimalCountByte <= 0xFF ? decimalCountByte : 0;
            const field: DbfField = {
                name: name,
                type: typeByte,
                length: lengthByte,
                decimalCount: decimalCount
            };

            this.fields.push(field);
            this.offset += 32;
            offset += 32;
        }

        return this.fields;
    }

    getRecord(): RecordData[] {
        const records: RecordData[] = [];
        const dbfArray: Uint8Array = this.dbfUint8Array;
        let recordOffset: number = this.offset;

        recordOffset += 1;

        while (recordOffset < 1466) {
        // while (recordOffset < dbfArray.length && dbfArray[recordOffset] !== 0x1A) {
            const record: RecordData = {};
            let fieldLength: number = 0;

            for (const [index, field] of this.fields.entries()) {
                fieldLength += field.length;
                const fieldData: Uint8Array =
                    field.decimalCount && field.decimalCount !== 0 ?
                        dbfArray.subarray(recordOffset, recordOffset + field.decimalCount) :
                        dbfArray.subarray(recordOffset, recordOffset + field.length);
                const fieldStr: string = Array.from(fieldData).map(byte => String.fromCharCode(byte)).join('').trim();

                if (field.type === 'N') {
                    record[field.name] = Number(fieldStr);
                    recordOffset += 1;

                    if (index === this.fields.length - 1) {
                        recordOffset -= 1;
                    }
                } else {
                    record[field.name] = fieldStr;
                }

                recordOffset += field.length;
            }

            records.push(record);
            this.offset += fieldLength;
        }

        console.log('contents: ', records);
        return records;
    }
}