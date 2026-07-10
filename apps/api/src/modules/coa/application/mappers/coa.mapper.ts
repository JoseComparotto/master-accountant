import { ChartOfAccountsEntity } from "@repo/coa-core";
import { AccountMapper } from "./account.mapper";
import { ChartOfAccountsDto } from "../../presentation/http/dtos/coa.dto";

export class ChartOfAccountsMapper {
    static toDto(chart: ChartOfAccountsEntity): ChartOfAccountsDto{
        return{
            version: chart.version.value,
            accounts: chart.accounts.map(AccountMapper.toDto)
        }   
    }
}