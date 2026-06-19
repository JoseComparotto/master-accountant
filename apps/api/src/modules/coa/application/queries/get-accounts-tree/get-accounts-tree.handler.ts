import { QueryHandler } from "@nestjs/cqrs";
import { AccountNodeDto } from "@repo/coa-contracts";
import { BaseGetAccountsTreeQueryHandler, GetAccountsTreeQuery } from "./get-accounts-tree.query";

@QueryHandler(GetAccountsTreeQuery)
export class GetAccountsTreeQueryHandler extends BaseGetAccountsTreeQueryHandler {
    async execute(query: GetAccountsTreeQuery): Promise<AccountNodeDto[]> {
        const chartId = this.getChartId(query);

        return await this.service.getAccountsTreeByChartId(chartId);
    }

}