/**
 * Simple proxy to the fetch function for now.
 * Can be updated later to limit the number of concurrent requests.
 * Can be made to work on stub for testing.
 */
export declare class PoolDownloaderr {
    private fetcher;
    constructor();
    fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
}
export declare function toto(): void;
