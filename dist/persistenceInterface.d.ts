import type { ResourcePotentialOutputJson } from '@toolproof-npm/schema';
export interface IntegerResourceType {
    identity: number;
}
/**
 * Reads an integer value from CAFS via HTTP API
 * @param path The full path to retrieve (e.g., TYPE-Natural/abc123...)
 */
export declare function readFromPersistence(path: string): Promise<number>;
export declare function writeToPersistence(potentialOutput: ResourcePotentialOutputJson, content: string): Promise<import("@toolproof-npm/schema").ResourceJson>;
