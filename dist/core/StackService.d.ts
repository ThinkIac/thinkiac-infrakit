import { PortainerClient } from './PortainerClient.js';
export declare class StackService {
    private client;
    constructor(client: PortainerClient);
    list(): Promise<any[]>;
    exists(name: string): Promise<boolean>;
    create(name: string, compose: string): Promise<void>;
    remove(name: string): Promise<void>;
}
