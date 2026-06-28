import { ChartOfAccountsDto } from "@repo/coa-contracts";
import { ChartOfAccountsEntity } from "@repo/coa-core";
import { AccountMapper } from "./account.mapper";

export class ChartOfAccountsMapper {
    static toDto(chart: ChartOfAccountsEntity): ChartOfAccountsDto{
        return{
            version: chart.version.value,
            accounts: chart.accounts.map(AccountMapper.toDto)
        }   
    }
}