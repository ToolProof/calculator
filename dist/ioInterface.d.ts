export interface IntegerResourceType {
    identity: number;
}
interface StoreContentResponse {
    storagePath: string;
    timestamp: string;
    contentHash?: string;
}
/**
 * Reads an integer value from CAFS via HTTP API
 * @param filePath The content hash or path to retrieve
 */
export declare function readFromCAFS(filePath: string): Promise<number>;
/**
 * Writes an integer value to CAFS via HTTP API
 * @param id The document ID
 * @param typeId The type ID
 * @param roleId The role ID
 * @param executionId The execution ID
 * @param value The integer value to store
 */
export declare function writeToCAFS(id: string, typeId: string, roleId: string, executionId: string, value: number): Promise<StoreContentResponse>;
export {};
