import { IAccountQuery, BaseAccountQueryHandler } from "../../bases/account-query-handler.base";
import { AccountDto } from "@repo/coa-contracts";

export class GetAccountByIdQuery implements IAccountQuery {
    constructor(
        public readonly accountId: string,
    ) {}
}

export abstract class BaseGetAccountByIdQueryHandler
    extends BaseAccountQueryHandler<GetAccountByIdQuery, AccountDto> { }