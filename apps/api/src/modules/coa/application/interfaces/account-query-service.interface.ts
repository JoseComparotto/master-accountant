import { UuidValue } from "@repo/shared-core";
import { ChartOfAccountsDto } from "../../presentation/http/dtos/coa.dto";
import { AccountDto, AccountNodeDto } from "../../presentation/http/dtos/accounts.dto";

export interface IAccountQueryService {

    getChart(): Promise<ChartOfAccountsDto>;

    getAllAccounts(): Promise<AccountDto[]>;

    getAccountsTree(): Promise<AccountNodeDto[]>;
    
    getAccountById(accountId: UuidValue): Promise<AccountDto>;

}