import { AccountDto, AccountNodeDto } from "@repo/coa-contracts";
import { UuidValue } from "@repo/shared-core";

export interface IAccountQueryService {

    getAllAccountsByChartId(chartId: UuidValue): Promise<AccountDto[]>;

    getAccountsTreeByChartId(chartId: UuidValue): Promise<AccountNodeDto[]>;
    
    getAccountById(chartId: UuidValue, accountId: UuidValue): Promise<AccountDto>;

}