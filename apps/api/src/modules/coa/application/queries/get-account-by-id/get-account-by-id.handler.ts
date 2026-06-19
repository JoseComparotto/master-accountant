import { QueryHandler } from "@nestjs/cqrs";
import { BaseGetAccountByIdQueryHandler, GetAccountByIdQuery } from "./get-account-by-id.query";
import { Ensure, UuidValue } from "@repo/shared-core";

@QueryHandler(GetAccountByIdQuery)
export class GetAccountByIdQueryHandler extends BaseGetAccountByIdQueryHandler {
    async execute(query: GetAccountByIdQuery) {

        const chartId = this.getChartId(query);
        const accountId = Ensure.vo('accountId', () => UuidValue.create(query.accountId));

        return await this.service.getAccountById(chartId, accountId);
    }
}