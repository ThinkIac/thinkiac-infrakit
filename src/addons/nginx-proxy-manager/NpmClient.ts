import fetch from 'node-fetch';

export class NpmClient {
  private token?: string;

  constructor(private config: { url: string; email: string; password: string }) {}

  async authenticate(): Promise<void> {
    const res = await fetch(`${this.config.url}/api/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: this.config.email, secret: this.config.password })
    });

    const data: any = await res.json();
    this.token = data.token;
  }

  async request(path: string, options: any = {}): Promise<any> {
    if (!this.token) await this.authenticate();

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
