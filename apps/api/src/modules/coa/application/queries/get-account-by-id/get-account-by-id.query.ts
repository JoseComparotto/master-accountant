import { AccountDto } from "../../../presentation/http/dtos/accounts.dto";
import { IAccountQuery, BaseAccountQueryHandler } from "../../bases/account-query-handler.base";

export class GetAccountByIdQuery implements IAccountQuery {
    constructor(
        public readonly accountId: string,
    ) {}
}

export abstract class BaseGetAccountByIdQueryHandler
    extends BaseAccountQueryHandler<GetAccountByIdQuery, AccountDto> { }