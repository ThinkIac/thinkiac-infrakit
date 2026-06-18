import { InfraKitConfig, TenantSpec } from './types.js';
import {
  TenantAlreadyExistsError,
  TenantNotFoundError,
  AddonProvisionError,
  InvalidConfigurationError,
  DockerAliasNotFoundError
} from './errors.js';
import { PortainerClient } from './PortainerClient.js';
import { StackService } from './StackService.js';
import {
  buildCompose,
  normalizeCompose,
  resolveComposePlaceholders,
  getInternalPort
} from './ComposeBuilder.js';
import { Addon } from '../addons/Addon.js';
import * as fs from 'fs';
import * as path from 'path';

export class InfraKit {
  private portainer: PortainerClient;
  private stacks: StackService;
  private addons: Addon[] = [];
  private dockerAliases: Map<string, string> = new Map();

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

  /**
   * Registra um alias local que aponta para um arquivo docker-compose já
   * existente no disco. Quando spec.image bater com esse alias em
   * createTenant(), o InfraKit usa o conteúdo do arquivo em vez de tratar
   * o valor como nome de imagem Docker (evitando um pull desnecessário).
   *
   * O arquivo referenciado deve ser um compose completo, no mesmo formato
   * exigido pelo fluxo spec.compose (normalizeCompose), podendo usar o
   * placeholder {{TENANT_ID}} no lugar do container_name fixo, já que o
   * mesmo alias pode ser reaproveitado para tenants diferentes.
   *
   * Lê o arquivo de forma síncrona e falha imediatamente (fail-fast) se o
   * path não existir, em vez de só estourar depois dentro de createTenant.
   */
  registerDocker(alias: string, composePath: string): void {
    const resolvedPath = path.resolve(composePath);
    if (!fs.existsSync(resolvedPath)) {
      throw new DockerAliasNotFoundError(
        `Compose file not found for alias "${alias}": ${resolvedPath}`
      );
    }
    const raw = fs.readFileSync(resolvedPath, 'utf-8');
    this.dockerAliases.set(alias, raw);
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
    const aliasTemplate = spec.image ? this.dockerAliases.get(spec.image) : undefined;

    if (aliasTemplate) {
      const resolved = resolveComposePlaceholders(aliasTemplate, spec.tenantId);
      compose = normalizeCompose(resolved, spec.tenantId);
    } else if (spec.compose) {
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
