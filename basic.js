import { InfraKit, nginxProxyManagerAddon } from './dist/index.js';

async function run() {
  const infrakit = new InfraKit({
    portainer: {
      url: 'https://panel.scriba.cloud',
      username: 'admin',
      password: 'tryIt@Salad10'
    },
    addons: {
      nginx: nginxProxyManagerAddon({
        url: 'http://localhost:81',
        email: 'admin@example.com',
        password: 'admin'
      })
    }
  });

  await infrakit.createTenant({
    tenantId: 'demo',
    image: 'nginx:alpine',
    expose: {
      domain: 'demo.localhost',
      ssl: false
    }
  });

  console.log('Tenant demo provisioned');
}

run().catch(console.error);
