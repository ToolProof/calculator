import { RESOURCE_CREATION } from '@toolproof-npm/shared';
// CAFS API Configuration
const CAFS_BASE_URL = process.env.CAFS_BASE_URL || 'http://34.39.50.174/api/cafs';
/**
 * Reads an integer value from CAFS via HTTP API
 * @param path The full path to retrieve (e.g., TYPE-Natural/abc123...)
 */
export async function readFromPersistence(path) {
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
        const content = JSON.parse(jsonData.content);
        if (typeof content.identity !== 'number') {
            throw new Error(`File ${path} does not contain a valid number value`);
        }
        return content.identity;
    }
    catch (error) {
        throw new Error(`Failed to read file ${path}: ${error}`);
    }
}
export async function writeToPersistence(potentialOutput, content) {
    try {
        // Create full materialized resource using shared utility
        const resource = RESOURCE_CREATION.createMaterializedResourceFromPotentialOutput(potentialOutput, JSON.parse(content));
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
    }
    catch (error) {
        throw new Error(`Failed to write file: ${error}`);
    }
}
