// CAFS API Configuration
const CAFS_BASE_URL = process.env.CAFS_BASE_URL || 'http://34.39.50.174/api/cafs';

// Interface for the JSON structure in storage files
export interface IntegerResourceType {
    identity: number;
}

// Interface for CAFS store response
interface StoreContentResponse {
    storagePath: string;
    timestamp: string;
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
        const path = filePath.split('/').pop() || '';
        const folder = filePath.split('/').slice(0, -1).join('/') || 'TYPE-Integer';
        const url = `${CAFS_BASE_URL}/retrieve/${path}?folder=${folder}`;

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

        if (typeof content.identity !== 'number') {
            throw new Error(`File ${filePath} does not contain a valid number value`);
        }

        return content.identity;
    } catch (error) {
        throw new Error(`Failed to read file ${filePath}: ${error}`);
    }
}


export async function writeToCAFS(
    meta: {
        id: string,
        typeId: string,
        creationContext: {
            roleId: string,
            executionId: string
        }
    },
    data: string
): Promise<StoreContentResponse> {
    try {
        const requestBody = {
            meta,
            content: data
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
