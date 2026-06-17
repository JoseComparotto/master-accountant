import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AccountMapper } from "../../mappers/account.mapper";
import { GetAccountByIdQuery } from "./get-account-by-id.query";
import { AccountDto } from "@repo/coa-contracts";
import { Inject } from "@nestjs/common";
import { Ensure, UuidValue } from "@repo/shared-core";
import type { IAccountQueryService } from "../../interfaces/account-query-service.interface";

@QueryHandler(GetAccountByIdQuery)
export class GetAccountByIdQueryHandler implements IQueryHandler<GetAccountByIdQuery> {
    constructor(
        @Inject('IAccountQueryService')
        private readonly service: IAccountQueryService,
    ) { }

    async execute(query: GetAccountByIdQuery): Promise<AccountDto> {

        const chartId = Ensure.vo('chartId', () => UuidValue.create(query.chartId));
        const accountId = Ensure.vo('accountId', () => UuidValue.create(query.accountId));
        
        return await this.service.getAccountById(chartId, accountId);
    }

}