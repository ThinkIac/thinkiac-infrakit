import { Addon, AddonContext } from '../Addon.js';
import { NpmClient } from './NpmClient.js';

export function nginxProxyManagerAddon(config: {
  url: string;
  email: string;
  password: string;
}): Addon {
  const client = new NpmClient(config);

  return {
    async onProvision(ctx: AddonContext) {
      if (!ctx.expose) return;

      await client.request('/api/nginx/proxy-hosts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain_names: [ctx.expose.domain],
          forward_host: ctx.containerName,
          forward_port: ctx.internalPort,
          scheme: 'http',
          ssl_forced: !!ctx.expose.ssl
        })
      });
    }
  };
}
