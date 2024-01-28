interface DbfField {
    name: string;
    type: string;
    length: number;
    decimalCount?: number;
}

interface RecordData {
    [fieldName: string]: string | number;
}
export class DbasefileReader {
    private fields: DbfField[] = [];
    private offset: number = 32;
    private arrayBuffer: ArrayBuffer;
    private dbfUint8Array: Uint8Array;

    constructor(arrayBuffer: ArrayBuffer) {
        this.arrayBuffer = arrayBuffer;
        this.dbfUint8Array = new Uint8Array(this.arrayBuffer);
    }
    getHeader(): DbfField[] {
        while(this.dbfUint8Array[this.offset] !== 0x0D) {
            const nameBytes: Uint8Array = this.dbfUint8Array.subarray(this.offset, this.offset + 10);
            const name: string = Array.from(nameBytes).map(byte => String.fromCharCode(byte)).join('').replace(/\0/g, '');
            const typeByte: string = String.fromCharCode(this.dbfUint8Array[this.offset + 11]);
            const lengthByte: number = this.dbfUint8Array[this.offset + 16];
            const decimalCountByte: number = this.dbfUint8Array[this.offset + 17];
            const decimalCount: number = decimalCountByte <= 0xF ? decimalCountByte : 0;

            const field: DbfField = {
                name: name,
                type: typeByte,
                length: lengthByte,
                decimalCount: decimalCount
            }

            this.fields.push(field);
            this.offset += 32;
        }

        return this.fields;
    }

    getContents(): RecordData[] {
        const records: RecordData[] = [];
        this.offset += 1;

        while (this.offset < this.dbfUint8Array.length && this.dbfUint8Array[this.offset] !== 0x1A) {
            const record: RecordData = {};

            for (const field of this.fields) {
                const fieldData: Uint8Array =
                    field.decimalCount && field.decimalCount !== 0 ?
                        this.dbfUint8Array.subarray(this.offset, this.offset + field.decimalCount) :
                        this.dbfUint8Array.subarray(this.offset, this.offset + field.length);
                const fieldStr: string = Array.from(fieldData).map(byte => String.fromCharCode(byte)).join('').trim();

                if (field.type === 'N') {
                    const numericStr: string = fieldStr.replace(/[^0-9.-]/g, '');
                    record[field.name] = parseFloat(numericStr) ?? null;
                    this.offset += 1;
                } else {
                    record[field.name] = fieldStr;
                }

                this.offset += field.length;
            }

            records.push(record);
            this.offset += this.fields.reduce((sum: number, field: DbfField) => sum + field.length, 0);
        }

        return records;
    }
}