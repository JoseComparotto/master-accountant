import type { AccountsApi } from "./contract";

// Real HTTP client for the Chart of Accounts API.
// Each method should issue a fetch(...) against the backend. Business rules
// (hierarchy validation, balanceType derivation) live on the server — this
// module is just the transport layer.
//
// Toggle on by setting VITE_USE_MOCK_API=false at build time.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

function notImplemented(method: string): never {
  throw new Error(
    `accountsApi.${method} not implemented. Set VITE_USE_MOCK_API=true or wire up the backend at ${BASE_URL}.`,
  );
}

export const accountsApi: AccountsApi = {
  async list() {
    notImplemented("list");
  },
  async usedLocalCodes() {
    notImplemented("usedLocalCodes");
  },
  async create() {
    notImplemented("create");
  },
  async update() {
    notImplemented("update");
  },
  async deactivate() {
    notImplemented("deactivate");
  },
  async activate() {
    notImplemented("activate");
  },
};
