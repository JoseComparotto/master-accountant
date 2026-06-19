import { AccountNodeDto } from "@repo/coa-contracts";
import { BaseAccountQuery, BaseAccountQueryHandler } from "../../bases/account-query-handler.base";

export class GetAccountsTreeQuery extends BaseAccountQuery { }

export abstract class BaseGetAccountsTreeQueryHandler
    extends BaseAccountQueryHandler<GetAccountsTreeQuery, AccountNodeDto[]> { }