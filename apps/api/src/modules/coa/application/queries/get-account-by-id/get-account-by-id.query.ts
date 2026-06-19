import { BaseAccountQuery, BaseAccountQueryHandler } from "../../bases/account-query-handler.base";
import { AccountDto } from "@repo/coa-contracts";

export class GetAccountByIdQuery extends BaseAccountQuery {
    constructor(
        public readonly chartId: string,
        public readonly accountId: string,
    ) {
        super(chartId);
    }
}

export abstract class BaseGetAccountByIdQueryHandler
    extends BaseAccountQueryHandler<GetAccountByIdQuery, AccountDto> { }