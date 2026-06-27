import { AccountDto, AccountNodeDto, ChartOfAccountsDto } from "@repo/coa-contracts";
import { UuidValue } from "@repo/shared-core";

export interface IAccountQueryService {

    getChart(): Promise<ChartOfAccountsDto>;

    getAllAccounts(): Promise<AccountDto[]>;

    getAccountsTree(): Promise<AccountNodeDto[]>;
    
    getAccountById(accountId: UuidValue): Promise<AccountDto>;

}