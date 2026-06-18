import { InfraKitConfig, TenantSpec } from './types.js';
export declare class InfraKit {
    private config;
    private portainer;
    private stacks;
    private addons;
    constructor(config: InfraKitConfig);
    private stackName;
    createTenant(spec: TenantSpec): Promise<void>;
    removeTenant(tenantId: string): Promise<void>;
    existsTenant(tenantId: string): Promise<boolean>;
}
