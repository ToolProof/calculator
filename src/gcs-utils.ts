import { Storage } from '@google-cloud/storage';

// Initialize Google Cloud Storage
const storage = new Storage();
const BUCKET_NAME = process.env.BUCKET_NAME || 'tp-resources'; // Default bucket name if not set

// Interface for the JSON structure in storage files
export interface IntegerInstance {
    semanticIdentity: number;
}

/**
 * Reads a number value from a Google Cloud Storage file
 * @param filePath The path to the file in the GCS bucket
 * @returns The numeric value from the file
 */
export async function readFromGCS(filePath: string): Promise<number> {
    try {
        const bucket = storage.bucket(BUCKET_NAME);
        const file = bucket.file(filePath);

        const [fileContents] = await file.download();
        const jsonData: IntegerInstance = JSON.parse(fileContents.toString());

        if (typeof jsonData.semanticIdentity !== 'number') {
            throw new Error(`File ${filePath} does not contain a valid number value`);
        }

        return jsonData.semanticIdentity;
    } catch (error) {
        throw new Error(`Failed to read file ${filePath}: ${error}`);
    }
}

/**
 * Writes a number value to a Google Cloud Storage file
 * @param filePath The path where to store the file in the GCS bucket
 * @param value The numeric value to store
 */
export async function writeToGCS(filePath: string, semanticIdentity: number): Promise<void> {
    try {
        const bucket = storage.bucket(BUCKET_NAME);
        const file = bucket.file(filePath);

        const jsonData: IntegerInstance = { semanticIdentity };
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
