import type { AccountsApi } from "./contract";
import { accountsApi as httpAccountsApi } from "./accountsApi";

const accounts: AccountsApi = httpAccountsApi;

export const api = {
  accounts,
};

export type Api = typeof api;
