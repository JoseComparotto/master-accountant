import { AccountDto, CreateAccountInputDto, PatchAccountInputDto } from "@repo/contracts";

export interface AccountsApi {
  list(): Promise<AccountDto[]>;
  usedLocalIndexes(parentId: string): Promise<number[]>;
  create(input: CreateAccountInputDto): Promise<AccountDto>;
  update(input: {id: string} & PatchAccountInputDto): Promise<AccountDto>;
  inactivate(id: string): Promise<AccountDto>;
  activate(id: string): Promise<AccountDto>;
}
