import type { AccountsApi } from "./contract";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

function notImplemented(method: string): never {
  throw new Error(
    `accountsApi.${method} not implemented. Set VITE_USE_MOCK_API=true or wire up the backend at ${BASE_URL}.`,
  );
}



export const accountsApi: AccountsApi = {
  async list() {
    const res = await fetch(`${BASE_URL}/accounts`);
    return await res.json();
  },
  async usedLocalIndexes(parentId) {
    const accounts = await this.list();
    const children = accounts.filter(acc => acc.parentId === parentId)
    return children.map(acc => acc.localIndex)
  },
  async create(input) {
    const res = await fetch(`${BASE_URL}/accounts`, {
      method: 'POST',
      body: JSON.stringify(input),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return await res.json();
  },
  async update({id, ...input}) {    
    const res = await fetch(`${BASE_URL}/accounts/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(input),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return await res.json();
  },
  async inactivate(id) {
    const res = await fetch(`${BASE_URL}/accounts/${id}/inactivate`, {
      method: 'PATCH'
    });
    return await res.json();
  },
  async activate(id) {
    const res = await fetch(`${BASE_URL}/accounts/${id}/activate`, {
      method: 'PATCH'
    });
    return await res.json();
  },
};
