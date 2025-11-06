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
        // retrieveContent now returns a string with the full JSON content
        const fileContents: string = await cafs.retrieveContent('TYPE-wSo0cBZk3yK9F5DUb9zV', filePath); // ATTENTION: hardcoded type ID
        const jsonData: IntegerResourceType = JSON.parse(fileContents);

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
export async function writeToCAFS(id: string, typeId: string, roleId: string, executionId: string, value: number) {
    try {
        const jsonData: IntegerResourceType =
        {
            semanticIdentity: value
        };
        const jsonString = JSON.stringify(jsonData, null, 2);

        const result = await cafs.storeContent(
            { id, typeId, roleId, executionId },
            jsonString
        );
        return result;
    } catch (error) {
        throw new Error(`Failed to write file: ${error}`);
    }
}
