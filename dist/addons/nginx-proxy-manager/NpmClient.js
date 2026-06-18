import fetch from 'node-fetch';
export class NpmClient {
    constructor(config) {
        this.config = config;
    }
    async authenticate() {
        const res = await fetch(`${this.config.url}/api/tokens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identity: this.config.email, secret: this.config.password })
        });
        const data = await res.json();
        this.token = data.token;
    }
    async request(path, options = {}) {
        if (!this.token)
            await this.authenticate();
        const res = await fetch(`${this.config.url}${path}`, {
            ...options,
            headers: {
                ...(options.headers || {}),
                Authorization: `Bearer ${this.token}`
            }
        });
        return res.json();
    }
}
