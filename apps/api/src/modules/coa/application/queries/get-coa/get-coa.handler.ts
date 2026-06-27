import { QueryHandler } from "@nestjs/cqrs";
import { AccountDto, ChartOfAccountsDto } from "@repo/coa-contracts";
import { GetChartOfAccountsQuery, BaseGetChartOfAccountsQueryHandler } from "./get-coa.queryt";

@QueryHandler(GetChartOfAccountsQuery)
export class GetChartOfAccountsQueryHandler extends BaseGetChartOfAccountsQueryHandler {
    async execute(query: GetChartOfAccountsQuery): Promise<ChartOfAccountsDto> {
        return await this.service.getChart();
    }

}