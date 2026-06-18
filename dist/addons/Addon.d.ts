export interface AddonContext {
    tenantId: string;
    stackName: string;
    serviceName: string;
    containerName: string;
    internalPort: number;
    expose?: {
        domain: string;
        ssl?: boolean;
    };
}
export interface Addon {
    onProvision(ctx: AddonContext): Promise<void>;
}
