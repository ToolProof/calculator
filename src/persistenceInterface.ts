import { RESOURCE_CREATION } from '@toolproof-npm/shared';
import type { ResourcePotentialOutputJson } from '@toolproof-npm/schema';

// CAFS API Configuration
const CAFS_BASE_URL = process.env.CAFS_BASE_URL || 'http://34.39.50.174/api/cafs';

// Interface for the JSON structure in storage files
export interface IntegerResourceType {
    identity: number;
}

/**
 * Reads an integer value from CAFS via HTTP API
 * @param path The full path to retrieve (e.g., TYPE-Natural/abc123...)
 */
export async function readFromPersistence(path: string): Promise<number> {
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


export async function writeToPersistence(
    potentialOutput: ResourcePotentialOutputJson,
    content: string
) {
    try {
        // Create full materialized resource using shared utility
        const resource = RESOURCE_CREATION.createMaterializedResourceFromPotentialOutput(
            potentialOutput,
            JSON.parse(content)
        );

        const requestBody = {
            resource
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

        await response.json(); // Verify successful storage
        
        // Return the complete materialized resource
        return resource;
    } catch (error) {
        throw new Error(`Failed to write file: ${error}`);
    }
}
