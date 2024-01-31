interface DbfField {
    name: string;
    type: string;
    length: number;
    decimalCount: number;
}

interface RecordData {
    [fieldName: string]: string | number;
}

export class DbaseLoader {
    private fields: DbfField[] = [];
    private offset: number = 32;
    private readonly arrayBuffer: ArrayBuffer;
    private readonly dbfUint8Array: Uint8Array;

    constructor(arrayBuffer: ArrayBuffer) {
        this.arrayBuffer = arrayBuffer;
        this.dbfUint8Array = new Uint8Array(this.arrayBuffer);
    }
    getDbaseField(): DbfField[] {
        const dbfArray: Uint8Array = this.dbfUint8Array;
        let offset: number = this.offset;

        while (dbfArray[offset] !== 0x0D) {
            const nameBytes: Uint8Array = dbfArray.subarray(offset, offset + 10);
            const typeByte: string = String.fromCharCode(dbfArray[offset + 11]);
            const lengthByte: number = dbfArray[offset + 16];
            const decimalCountByte: number = dbfArray[offset + 17];

            const name: string = Array.from(nameBytes).map(byte => String.fromCharCode(byte)).join('').replace(/\0/g, '');
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

    readRecords(): RecordData[] {
        this.getDbaseField();

        const headerLength = this.offset;
        const recordLengthByte = this.dbfUint8Array.subarray(8, 10);
        const recordLength = recordLengthByte[0] + (recordLengthByte[1] << 8);

        const records: RecordData[] = [];
        const dbfArray = this.dbfUint8Array.subarray(headerLength, this.dbfUint8Array.length);
        let recordOffset = 0;

        while (recordOffset + recordLength <= 1000) {
            const record: RecordData = {};

            for (const field of this.fields) {
                const fieldValue = dbfArray.subarray(recordOffset, recordOffset + field.length);

                switch (field.type) {
                    case 'C':
                        record[field.name] = this.readRecordForString(fieldValue);
                        break;
                    case 'N':
                        record[field.name] = Number(this.readRecordForString(fieldValue));
                        break;
                }

                console.log('single record: ', record);
                records.push(record);
                recordOffset += field.length;
            }

            recordOffset += recordOffset;
        }

        console.log('records: ', records);

        return records;
    }

    readRecordForString(fieldData: Uint8Array) {
        return Array.from(fieldData).map(byte => String.fromCharCode(byte)).join('').trim();
    }
}