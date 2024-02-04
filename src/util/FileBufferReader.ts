export class FileBufferReader {
    public static readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
        return new Promise((resolve, reject): void => {
            const reader: FileReader = new FileReader();

            reader.onload = (): void => {
                if (reader.result instanceof ArrayBuffer) {
                    resolve(reader.result);
                } else {
                    reject(new Error('Failed to read file as ArrayBuffer.'));
                }
            };

            reader.onerror = (): void => {
                reject(new Error('Error reading the file.'));
            };

            reader.readAsArrayBuffer(file);
        });
    }
}
