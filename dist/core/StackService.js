import { StackProvisionError } from './errors.js';
export class StackService {
    constructor(client) {
        this.client = client;
    }
    async list() {
        return this.client.request('/api/stacks');
    }
    async exists(name) {
        const stacks = await this.list();
        return stacks.some(s => s.Name === name);
    }
    async create(name, compose) {
        const endpointId = this.client.getEndpointId();
        try {
            await this.client.request(`/api/stacks/create/standalone/string?endpointId=${endpointId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Name: name,
                    StackFileContent: compose
                })
            });
        }
        catch (e) {
            throw new StackProvisionError(String(e));
        }
    }
    async remove(name) {
        const stacks = await this.list();
        const stack = stacks.find(s => s.Name === name);
        if (!stack)
            return;
        const endpointId = this.client.getEndpointId();
        await this.client.request(`/api/stacks/${stack.Id}?endpointId=${endpointId}`, {
            method: 'DELETE'
        });
    }
}
