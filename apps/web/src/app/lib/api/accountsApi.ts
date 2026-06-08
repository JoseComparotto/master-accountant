import type { AccountsApi } from "./contract";
import { apiContract } from '@repo/contracts'
import { initClient } from '@ts-rest/core';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

const { accounts } = initClient(apiContract, {
  baseUrl: BASE_URL
})

function throwError(body?: any): never {
  if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
    throw new Error(body.message);
  }
  console.warn(body);
  throw new Error('Um erro inesperado aconteceu.');
}

export const accountsApi: AccountsApi = {

  async list() {
    const { status, body } = await accounts.getAll();
    if (status === 200) return body;
    throwError();
  },

  async usedLocalIndexes(parentId) {
    const accounts = await this.list();
    const children = accounts.filter(acc => acc.parentId === parentId)
    return children.map(acc => acc.localIndex)
  },

  async create(input) {
    const { status, body } = await accounts.create({
      body: input
    });
    if (status === 201) return body;
    throwError(body);
  },

  async update({ id, ...input }) {
    const { status, body } = await accounts.patch({
      params: { id },
      body: input
    });
    if (status === 200) return body;
    throwError(body);
  },

  async activate(id) {
    const { status, body } = await accounts.activate({
      params: { id },
    });
    if (status === 200) return body;
    throwError(body);
  },

  async inactivate(id) {
    const { status, body } = await accounts.inactivate({
      params: { id },
    });
    if (status === 200) return body;
    throwError(body);
  },
}
