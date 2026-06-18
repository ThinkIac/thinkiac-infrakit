import { TenantAlreadyExistsError, TenantNotFoundError, AddonProvisionError, InvalidConfigurationError } from './errors.js';
import { PortainerClient } from './PortainerClient.js';
import { StackService } from './StackService.js';
import { buildCompose, normalizeCompose, getInternalPort } from './ComposeBuilder.js';
export class InfraKit {
    constructor(config) {
        this.config = config;
        this.addons = [];
        this.portainer = new PortainerClient(config.portainer);
        this.stacks = new StackService(this.portainer);
        if (config.addons) {
            this.addons = Object.values(config.addons);
        }
    }
    stackName(tenantId) {
        return `tenant_${tenantId}`;
    }
    async createTenant(spec) {
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
        let compose;
        if (spec.compose) {
            compose = normalizeCompose(spec.compose, spec.tenantId);
        }
        else {
            compose = buildCompose({
                tenantId: spec.tenantId,
                image: spec.image,
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
            }
            catch (e) {
                throw new AddonProvisionError(String(e));
            }
        }
    }
    async removeTenant(tenantId) {
        const name = this.stackName(tenantId);
        if (!(await this.existsTenant(tenantId))) {
            throw new TenantNotFoundError(`Tenant ${tenantId} not found`);
        }
        await this.stacks.remove(name);
    }
    async existsTenant(tenantId) {
        return this.stacks.exists(this.stackName(tenantId));
    }
}
