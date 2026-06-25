import { AccountNodeDto } from "@repo/coa-contracts";
import { IAccountQuery, BaseAccountQueryHandler } from "../../bases/account-query-handler.base";

export class GetAccountsTreeQuery implements IAccountQuery { }

export abstract class BaseGetAccountsTreeQueryHandler
    extends BaseAccountQueryHandler<GetAccountsTreeQuery, AccountNodeDto[]> { }