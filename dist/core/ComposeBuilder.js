const INTERNAL_PORT = 3000;
export function buildCompose(input) {
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
export function normalizeCompose(raw, tenantId) {
    if (!raw.includes('services:')) {
        throw new Error('Invalid docker-compose: missing services section');
    }
    if (raw.match(/\n\s*ports:/)) {
        throw new Error('Host port publishing is not allowed in InfraKit v1');
    }
    const serviceMatches = raw.match(/^\s{2}[a-zA-Z0-9_-]+:/gm) || [];
    if (serviceMatches.length !== 1) {
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
export function getInternalPort() {
    return INTERNAL_PORT;
}
