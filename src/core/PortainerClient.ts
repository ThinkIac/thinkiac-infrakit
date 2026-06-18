import fetch from 'node-fetch';
import { PortainerAuthError } from './errors.js';
import { PortainerConfig } from './types.js';

export class PortainerClient {
  private token?: string;
  private endpointId: number;

  constructor(private config: PortainerConfig) {
    this.endpointId = config.endpointId ?? 1;
  }

  async authenticate(): Promise<void> {
    const res = await fetch(`${this.config.url}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Username: this.config.username,
        Password: this.config.password
      })
    });

    if (!res.ok) throw new PortainerAuthError('Portainer authentication failed');

    const data: any = await res.json();
    this.token = data.jwt;
  }

  async request<T>(path: string, options: any = {}): Promise<T> {
    if (!this.token) await this.authenticate();

    const res = await fetch(`${this.config.url}${path}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${this.token}`
      }
    });

    if (res.status === 401) {
      this.token = undefined;
      return this.request<T>(path, options);
    }

    if (!res.ok) throw new Error(`Portainer request failed: ${res.status}`);

    return res.json() as Promise<T>;
  }

  getEndpointId(): number {
    return this.endpointId;
  }
}
