import { PortainerConfig } from './types.js';
export declare class PortainerClient {
    private config;
    private token?;
    private endpointId;
    constructor(config: PortainerConfig);
    authenticate(): Promise<void>;
    request<T>(path: string, options?: any): Promise<T>;
    getEndpointId(): number;
}
