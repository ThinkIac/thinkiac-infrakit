import { InfraKitConfig, TenantSpec } from './types.js';
import {
  TenantAlreadyExistsError,
  TenantNotFoundError,
  AddonProvisionError,
  InvalidConfigurationError
} from './errors.js';
import { PortainerClient } from './PortainerClient.js';
import { StackService } from './StackService.js';
import { buildCompose, normalizeCompose, getInternalPort } from './ComposeBuilder.js';
import { Addon } from '../addons/Addon.js';

export class InfraKit {
  private portainer: PortainerClient;
  private stacks: StackService;
  private addons: Addon[] = [];

  constructor(private config: InfraKitConfig) {
    this.portainer = new PortainerClient(config.portainer);
    this.stacks = new StackService(this.portainer);

    if (config.addons) {
      this.addons = Object.values(config.addons) as Addon[];
    }
  }

  private stackName(tenantId: string): string {
    return `tenant_${tenantId}`;
  }

  async createTenant(spec: TenantSpec): Promise<void> {
    const name = this.stackName(spec.tenantId);

    if (await this.existsTenant(spec.tenantId)) {
      throw new TenantAlreadyExistsError(`Tenant ${spec.tenantId} already exists`);
    }

    if (spec.image && spec.compose) {
      throw new InvalidConfigurationError('Provide either image or compose, not both');
    }

    if (!spec.image && !spec.compose) {
      throw new InvalidConfigurationError('Either image or compose must be provided');
    }

    let compose: string;

    if (spec.compose) {
      compose = normalizeCompose(spec.compose, spec.tenantId);
    } else {
      compose = buildCompose({
        tenantId: spec.tenantId,
        image: spec.image!,
        env: spec.env
      });
    }

    await this.stacks.create(name, compose);

    const addonContext = {
      tenantId: spec.tenantId,
      stackName: name,
      serviceName: 'app',
      containerName: `app_${spec.tenantId}`,
      internalPort: getInternalPort(),
      expose: spec.expose
    };

    for (const addon of this.addons) {
      try {
        await addon.onProvision(addonContext);
      } catch (e) {
        throw new AddonProvisionError(String(e));
      }
    }
  }

  async removeTenant(tenantId: string): Promise<void> {
    const name = this.stackName(tenantId);

    if (!(await this.existsTenant(tenantId))) {
      throw new TenantNotFoundError(`Tenant ${tenantId} not found`);
    }

    await this.stacks.remove(name);
  }

  async existsTenant(tenantId: string): Promise<boolean> {
    return this.stacks.exists(this.stackName(tenantId));
  }
}
