import { AccountDto, AccountNodeDto } from "@repo/coa-contracts";
import { UuidValue } from "@repo/shared-core";

export interface IAccountQueryService {

    getAllAccounts(): Promise<AccountDto[]>;

    getAccountsTree(): Promise<AccountNodeDto[]>;
    
    getAccountById(accountId: UuidValue): Promise<AccountDto>;

}