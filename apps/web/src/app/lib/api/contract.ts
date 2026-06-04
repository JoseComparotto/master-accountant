import type {
  Account,
  CreateAccountInput,
  UpdateAccountInput,
} from "../../features/accounts/types";

// REST contract for Chart of Accounts. Both the in-memory mock and the future
// HTTP client must satisfy this interface.
export interface AccountsApi {
  list(): Promise<Account[]>;
  usedLocalIndexes(parentId: string): Promise<number[]>;
  create(input: CreateAccountInput): Promise<Account>;
  update(input: UpdateAccountInput): Promise<Account>;
  inactivate(id: string): Promise<Account>;
  activate(id: string): Promise<Account>;
}
