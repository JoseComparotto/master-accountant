import { AccountDto } from "@repo/coa-contracts";
import { IAccountQuery, BaseAccountQueryHandler } from "../../bases/account-query-handler.base";

export class GetAllAccountsQuery implements IAccountQuery { }

export abstract class BaseGetAllAccountsQueryHandler
    extends BaseAccountQueryHandler<GetAllAccountsQuery, AccountDto[]> { }