import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllAccountsQuery } from "./get-all-accounts.query";
import { AccountMapper } from "../../mappers/account.mapper";
import { AccountDto } from "@repo/coa-contracts";
import { Inject } from "@nestjs/common";
import { Ensure, UuidValue } from "@repo/shared-core";
import type { IAccountQueryService } from "../../interfaces/account-query-service.interface";

@QueryHandler(GetAllAccountsQuery)
export class GetAllAccountsQueryHandler implements IQueryHandler<GetAllAccountsQuery> {
    constructor(
        @Inject('IAccountQueryService')
        private readonly service: IAccountQueryService,
    ) { }

    async execute(query: GetAllAccountsQuery): Promise<AccountDto[]> {
        const chartId = Ensure.vo('chartId', () => UuidValue.create(query.chartId));

        return await this.service.getAllAccountsByChartId(chartId);
    }

}