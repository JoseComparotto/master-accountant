import { AccountDto } from "@repo/coa-contracts";
import { UuidValue } from "@repo/shared-core";

export interface IAccountQueryService {

    getAllAccountsByChartId(chartId: UuidValue): Promise<AccountDto[]>;
    getAccountById(chartId: UuidValue, accountId: UuidValue): Promise<AccountDto>;
    
}