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
export declare function writeToCAFS(meta: {
    id: string;
    typeId: string;
    creationContext: {
        roleId: string;
        executionId: string;
    };
}, data: string): Promise<StoreContentResponse>;
export {};
