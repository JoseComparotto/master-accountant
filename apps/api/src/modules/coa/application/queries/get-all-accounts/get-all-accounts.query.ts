import { AccountDto } from "@repo/coa-contracts";
import { BaseAccountQuery, BaseAccountQueryHandler } from "../../bases/account-query-handler.base";

export class GetAllAccountsQuery extends BaseAccountQuery { }

export abstract class BaseGetAllAccountsQueryHandler
    extends BaseAccountQueryHandler<GetAllAccountsQuery, AccountDto[]> { }