import { QueryHandler } from "@nestjs/cqrs";
import { BaseGetAllAccountsQueryHandler, GetAllAccountsQuery } from "./get-all-accounts.query";
import { AccountDto } from "@repo/coa-contracts";

@QueryHandler(GetAllAccountsQuery)
export class GetAllAccountsQueryHandler extends BaseGetAllAccountsQueryHandler {
    async execute(query: GetAllAccountsQuery): Promise<AccountDto[]> {
        const chartId = this.getChartId(query);

        return await this.service.getAllAccountsByChartId(chartId);
    }

}