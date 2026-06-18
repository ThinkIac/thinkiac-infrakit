export type TenantId = string;
export interface PortainerConfig {
    url: string;
    username: string;
    password: string;
    endpointId?: number;
}
export interface InfraKitConfig {
    portainer: PortainerConfig;
    addons?: Record<string, any>;
}
export interface TenantSpec {
    tenantId: TenantId;
    image?: string;
    env?: Record<string, string>;
    compose?: string;
    expose?: {
        domain: string;
        ssl?: boolean;
    };
}
