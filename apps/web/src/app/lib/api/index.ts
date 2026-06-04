// Central API entrypoint. As new domains are added (subLedgers, journalEntries)
// expose them here so consumers import from a single place.
//
//   import { api } from "@/app/lib/api";
//   api.accounts.list();
//
// The mock implementation is used by default during development. Set
// VITE_USE_MOCK_API=false to swap in the real HTTP client.

// TODO: Conectar frontend com a api do projeto
// TODO: Criar pacote api-client

import type { AccountsApi } from "./contract";
import { accountsApi as mockAccountsApi } from "./mock/accountsApi";
import { accountsApi as httpAccountsApi } from "./accountsApi";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== "false";

const accounts: AccountsApi = USE_MOCK ? mockAccountsApi : httpAccountsApi;

export const api = {
  accounts,
};

export type Api = typeof api;
