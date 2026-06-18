const INTERNAL_PORT = 3000;

/**
 * Conta quantos services existem dentro do bloco `services:` de um
 * docker-compose. Isola o bloco services e para de contar ao encontrar
 * a próxima seção de nível raiz (ex: networks:, volumes:), evitando
 * falsos positivos como contar "  proxy:" dentro de "networks:" como
 * se fosse um segundo service (bug do regex global anterior).
 */
function countServices(raw: string): number {
  const lines = raw.split('\n');
  let inServices = false;
  let count = 0;
  for (const line of lines) {
    if (/^services:\s*$/.test(line)) {
      inServices = true;
      continue;
    }
    if (!inServices) continue;
    // Linha sem indentação = nova seção de nível raiz, saiu de services:
    if (/^\S/.test(line)) {
      inServices = false;
      continue;
    }
    // Um service é uma chave com exatamente 2 espaços de indentação
    if (/^\s{2}[a-zA-Z0-9_.-]+:\s*$/.test(line)) {
      count++;
    }
  }
  return count;
}

export function buildCompose(input: {
  tenantId: string;
  image: string;
  env?: Record<string, string>;
}): string {
  const envLines = Object.entries(input.env || {})
    .map(([k, v]) => `      ${k}: ${v}`)
    .join('\n');
  return `version: "3.9"
services:
  app:
    image: ${input.image}
    container_name: app_${input.tenantId}
    expose:
      - "${INTERNAL_PORT}"
    networks:
      - proxy
    environment:
${envLines || '      {}'}
    restart: always
networks:
  proxy:
    external: true
`;
}

export function normalizeCompose(raw: string, tenantId: string): string {
  if (!raw.includes('services:')) {
    throw new Error('Invalid docker-compose: missing services section');
  }
  if (raw.match(/\n\s*ports:/)) {
    throw new Error('Host port publishing is not allowed in InfraKit v1');
  }
  if (countServices(raw) !== 1) {
    throw new Error('InfraKit v1 requires exactly one service per stack');
  }
  if (!raw.includes('container_name:')) {
    throw new Error('container_name is required in InfraKit v1');
  }
  if (!raw.includes(`container_name: app_${tenantId}`)) {
    throw new Error(`container_name must be app_${tenantId}`);
  }
  if (!raw.includes('networks:') || !raw.includes('proxy')) {
    throw new Error('Service must be attached to proxy network');
  }
  return raw;
}

export function getInternalPort(): number {
  return INTERNAL_PORT;
}

/**
 * Substitui placeholders de template (ex: {{TENANT_ID}}) por valores reais
 * antes de rodar a validação em normalizeCompose. Usado pelo fluxo de
 * docker aliases registrados via InfraKit.registerDocker().
 */
export function resolveComposePlaceholders(raw: string, tenantId: string): string {
  return raw.replace(/\{\{\s*TENANT_ID\s*\}\}/g, tenantId);
}
