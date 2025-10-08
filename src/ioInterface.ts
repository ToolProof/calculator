import { createCAFS } from 'gcs_utils';

const cafs = createCAFS();

// Interface for the JSON structure in storage files
export interface IntegerResourceType {
    semanticIdentity: number;
}

/**
 * Reads an integer value from a Google Cloud Storage file, via CAFS
 * @param filePath The path to the file in the GCS bucket
 */
export async function readFromCAFS(filePath: string): Promise<number> {
    try {

        const [fileContents] = await cafs.retrieveContent('RET-eSDHNowTprW6KEI2BWVI', filePath);
        const jsonData: IntegerResourceType = JSON.parse(fileContents.toString());

        if (typeof jsonData.semanticIdentity !== 'number') {
            throw new Error(`File ${filePath} does not contain a valid number value`);
        }

        return jsonData.semanticIdentity;
    } catch (error) {
        throw new Error(`Failed to read file ${filePath}: ${error}`);
    }
}

/** Writes an integer value to a Google Cloud Storage file, via CAFS
 * @param value The integer value to store
 */
export async function writeToCAFS(resourceId: string, value: number) {
    try {
        const jsonData: IntegerResourceType =
        {
            semanticIdentity: value
        };
        const jsonString = JSON.stringify(jsonData, null, 2);

        const result = await cafs.storeContent('RET-eSDHNowTprW6KEI2BWVI', resourceId, jsonString);
        return result;
    } catch (error) {
        throw new Error(`Failed to write file: ${error}`);
    }
}
