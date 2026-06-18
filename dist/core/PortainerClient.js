import fetch from 'node-fetch';
import { PortainerAuthError } from './errors.js';
export class PortainerClient {
    constructor(config) {
        this.config = config;
        this.endpointId = config.endpointId ?? 1;
    }
    async authenticate() {
        const res = await fetch(`${this.config.url}/api/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Username: this.config.username,
                Password: this.config.password
            })
        });
        if (!res.ok)
            throw new PortainerAuthError('Portainer authentication failed');
        const data = await res.json();
        this.token = data.jwt;
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
        if (res.status === 401) {
            this.token = undefined;
            return this.request(path, options);
        }
        if (!res.ok)
            throw new Error(`Portainer request failed: ${res.status}`);
        return res.json();
    }
    getEndpointId() {
        return this.endpointId;
    }
}
