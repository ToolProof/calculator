import { RESOURCE_CREATION } from '@toolproof-npm/shared';
import type { ResourcePotentialOutputJson } from '@toolproof-npm/schema';

// CAFS API Configuration
const CAFS_BASE_URL = process.env.CAFS_BASE_URL || 'http://34.39.50.174/api/cafs';

// Interface for the JSON structure in storage files
export interface IntegerResourceType {
    identity: number;
}

// Interface for CAFS store response
interface StoreContentResponse {
    success: boolean;
    path: string;
    message?: string;
}

/**
 * Reads an integer value from CAFS via HTTP API
 * @param path The full path to retrieve (e.g., TYPE-Natural/abc123...)
 */
export async function readFromCAFS(path: string): Promise<number> {
    try {
        const url = `${CAFS_BASE_URL}/retrieve/${path}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonData = await response.json();
        const content: IntegerResourceType = JSON.parse(jsonData.content);

        if (typeof content.identity !== 'number') {
            throw new Error(`File ${path} does not contain a valid number value`);
        }

        return content.identity;
    } catch (error) {
        throw new Error(`Failed to read file ${path}: ${error}`);
    }
}


export async function writeToCAFS(
    potentialOutput: ResourcePotentialOutputJson,
    data: string
): Promise<StoreContentResponse> {
    try {
        // Create full materialized resource using shared utility
        const resource = RESOURCE_CREATION.createMaterializedResource(potentialOutput, {
            content: data,
            extractedData: JSON.parse(data),
        });

        const requestBody = {
            resource,
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
        // Map persistence response to expected format
        return {
            success: result.success,
            path: result.path,
        };
    } catch (error) {
        throw new Error(`Failed to write file: ${error}`);
    }
}
