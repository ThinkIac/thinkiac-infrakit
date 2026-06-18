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

  // Option A: image-based provisioning (default v1 path)
  image?: string;
  env?: Record<string, string>;

  // Option B: raw docker-compose provisioning
  compose?: string;

  expose?: {
    domain: string;
    ssl?: boolean;
  };
}
