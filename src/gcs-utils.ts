import { Storage } from '@google-cloud/storage';

// Initialize Google Cloud Storage
const storage = new Storage();
const BUCKET_NAME = process.env.BUCKET_NAME || 'tp_resources';

// Interface for the JSON structure in storage files
export interface NumberValue {
    value: number;
}

/**
 * Reads a number value from a Google Cloud Storage file
 * @param filePath The path to the file in the GCS bucket
 * @returns The numeric value from the file
 */
export async function readNumberFromGCS(filePath: string): Promise<number> {
    try {
        const bucket = storage.bucket(BUCKET_NAME);
        const file = bucket.file(filePath);

        const [fileContents] = await file.download();
        const jsonData: NumberValue = JSON.parse(fileContents.toString());

        if (typeof jsonData.value !== 'number') {
            throw new Error(`File ${filePath} does not contain a valid number value`);
        }

        return jsonData.value;
    } catch (error) {
        throw new Error(`Failed to read file ${filePath}: ${error}`);
    }
}

/**
 * Writes a number value to a Google Cloud Storage file
 * @param filePath The path where to store the file in the GCS bucket
 * @param value The numeric value to store
 */
export async function writeNumberToGCS(filePath: string, value: number): Promise<void> {
    try {
        const bucket = storage.bucket(BUCKET_NAME);
        const file = bucket.file(filePath);

        const jsonData: NumberValue = { value };
        const jsonString = JSON.stringify(jsonData, null, 2);

        await file.save(jsonString, {
            metadata: {
                contentType: 'application/json',
            },
        });
    } catch (error) {
        throw new Error(`Failed to write file ${filePath}: ${error}`);
    }
}
