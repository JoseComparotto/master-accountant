import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllAccountsQuery } from "../queries/get-all-accounts.query";
import { type IChartOfAccountsRepository } from "@repo/coa-core";
import { AccountMapper } from "../mappers/account.mapper";
import { AccountDto } from "@repo/coa-contracts";
import { Inject } from "@nestjs/common";
import { Ensure, UuidValue } from "@repo/shared-core";

@QueryHandler(GetAllAccountsQuery)
export class GetAllAccountsQueryHandler implements IQueryHandler<GetAllAccountsQuery> {
    constructor(
        @Inject('IChartOfAccountsRepository')
        private readonly repo: IChartOfAccountsRepository,
    ) { }

    async execute(query: GetAllAccountsQuery): Promise<AccountDto[]> {

        const chartId = Ensure.vo('chartId', () => UuidValue.create(query.chartId));

        const chart = await this.repo.getById(chartId);

        const { accounts } = chart;

        return accounts.sort((a, b) => a.structuralCode.compareTo(b.structuralCode))
            .map(AccountMapper.toDto);
    }

}