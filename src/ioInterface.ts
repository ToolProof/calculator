// CAFS API Configuration
const CAFS_BASE_URL = process.env.CAFS_BASE_URL || 'http://34.147.128.57/api/cafs';

// Interface for the JSON structure in storage files
export interface IntegerResourceType {
    semanticIdentity: number;
}

// Interface for CAFS store response
interface StoreContentResponse {
    storagePath: string;
    contentHash?: string;
}

/**
 * Reads an integer value from CAFS via HTTP API
 * @param filePath The content hash or path to retrieve
 */
export async function readFromCAFS(filePath: string): Promise<number> {
    try {
        // Extract folder name from filePath if it contains a folder structure
        // Format: retrieve/[content-hash]?folder=[foldername]
        const url = `${CAFS_BASE_URL}/retrieve/${filePath}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const fileContents: string = await response.text();
        const jsonData = JSON.parse(fileContents);

        const content: IntegerResourceType = JSON.parse(jsonData.content);

        if (typeof content.semanticIdentity !== 'number') {
            throw new Error(`File ${filePath} does not contain a valid number value`);
        }

        return content.semanticIdentity;
    } catch (error) {
        throw new Error(`Failed to read file ${filePath}: ${error}`);
    }
}

/**
 * Writes an integer value to CAFS via HTTP API
 * @param id The document ID
 * @param typeId The type ID
 * @param roleId The role ID
 * @param executionId The execution ID
 * @param value The integer value to store
 */
export async function writeToCAFS(
    id: string,
    typeId: string,
    roleId: string,
    executionId: string,
    value: number
): Promise<StoreContentResponse> {
    try {
        const jsonData: IntegerResourceType = {
            semanticIdentity: value
        };
        const content = JSON.stringify(jsonData, null, 2);

        const requestBody = {
            meta: {
                id,
                typeId,
                roleId,
                executionId
            },
            content
        };

        const response = await fetch(`${CAFS_BASE_URL}/store`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: StoreContentResponse = await response.json();
        return result;
    } catch (error) {
        throw new Error(`Failed to write file: ${error}`);
    }
}
