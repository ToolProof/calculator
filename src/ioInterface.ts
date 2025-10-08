import { createCAFS } from 'gcs_utils';

const cafs = createCAFS();

// Interface for the JSON structure in storage files
export interface IntegerResourceType {
    semanticIdentity: number;
}

/**
 * Reads a number value from a Google Cloud Storage file, via CAFS
 * @param filePath The path to the file in the GCS bucket
 */
export async function readFromCAFS(filePath: string): Promise<number> {
    try {

        const [fileContents] = await cafs.read(filePath);
        const jsonData: IntegerResourceType = JSON.parse(fileContents.toString());

        if (typeof jsonData.semanticIdentity !== 'number') {
            throw new Error(`File ${filePath} does not contain a valid number value`);
        }

        return jsonData.semanticIdentity;
    } catch (error) {
        throw new Error(`Failed to read file ${filePath}: ${error}`);
    }
}

/** Writes a number value to a Google Cloud Storage file, via CAFS
 * @param value The numeric value to store
 */
export async function writeToCAFS(value: number): Promise<string> {
    try {
        const jsonData: IntegerResourceType =
        {
            semanticIdentity: value
        };
        const jsonString = JSON.stringify(jsonData, null, 2);

        // ATTENTION_RONAK: cafs must return the path where it stored the file
        const outputPath = await cafs.write(jsonString);
        return outputPath;
    } catch (error) {
        throw new Error(`Failed to write file: ${error}`);
    }
}
