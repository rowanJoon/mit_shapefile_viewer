export class FileReaderPromise {
    static readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const reader: FileReader = new FileReader();

            reader.onload = () => {
                if (reader.result instanceof ArrayBuffer) {
                    resolve(reader.result);
                } else {
                    reject(new Error('Failed to read file as ArrayBuffer.'));
                }
            };

            reader.onerror = () => {
                reject(new Error('Error reading the file.'));
            };

            reader.readAsArrayBuffer(file);
        });
    }
}
