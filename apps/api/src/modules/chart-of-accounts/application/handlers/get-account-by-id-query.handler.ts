import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AccountMapper } from "../mappers/account.mapper";
import { GetAccountByIdQuery } from "../queries/get-account-by-id.query";
import { AccountDto } from "@repo/contracts";
import { Inject } from "@nestjs/common";
import { Ensure, UuidValue, type IChartOfAccountsRepository } from "@repo/core";
@QueryHandler(GetAccountByIdQuery)
export class GetAccountByIdQueryHandler implements IQueryHandler<GetAccountByIdQuery> {
    constructor(
        @Inject('IChartOfAccountsRepository')
        private readonly repo: IChartOfAccountsRepository,
    ) { }

    async execute(query: GetAccountByIdQuery): Promise<AccountDto> {

        const chartId = Ensure.vo('chartId', () => UuidValue.create(query.chartId));
        const accountId = Ensure.vo('accountId', () => UuidValue.create(query.accountId));
        
        const chart = await this.repo.getById(chartId);

        const account = chart.getAccountById(accountId);

        await this.repo.save(chart);

        return AccountMapper.toDto(account);
    }

}