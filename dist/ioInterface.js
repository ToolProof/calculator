// CAFS API Configuration
const CAFS_BASE_URL = process.env.CAFS_BASE_URL || 'http://34.147.128.57/api/cafs';
/**
 * Reads an integer value from CAFS via HTTP API
 * @param filePath The content hash or path to retrieve
 */
export async function readFromCAFS(filePath) {
    try {
        // Extract folder name from filePath if it contains a folder structure
        // Format: retrieve/[content-hash]?folder=[foldername]
        const url = `${CAFS_BASE_URL}/retrieve/${filePath}?folder=TYPE-Integer`;
        console.log("url -> ", url);
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log("response -> ", response);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const fileContents = await response.text();
        console.log("fileContents -> ", fileContents);
        const jsonData = JSON.parse(fileContents);
        console.log("jsonData -> ", jsonData);
        const content = JSON.parse(jsonData.content);
        console.log("content -> ", content);
        if (typeof content.semanticIdentity !== 'number') {
            throw new Error(`File ${filePath} does not contain a valid number value`);
        }
        return content.semanticIdentity;
    }
    catch (error) {
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
export async function writeToCAFS(id, typeId, roleId, executionId, value) {
    try {
        const jsonData = {
            semanticIdentity: value
        };
        const content = JSON.stringify(jsonData, null, 2);
        console.log("content -> ", content);
        const requestBody = {
            meta: {
                id,
                typeId,
                roleId,
                executionId
            },
            content
        };
        console.log("requestBody -> ", requestBody);
        const response = await fetch(`${CAFS_BASE_URL}/store`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        console.log("response -> ", response);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log("result -> ", result);
        return result;
    }
    catch (error) {
        throw new Error(`Failed to write file: ${error}`);
    }
}
