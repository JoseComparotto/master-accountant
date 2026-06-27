import { AccountDto, ChartOfAccountsDto } from "@repo/coa-contracts";
import { IAccountQuery, BaseAccountQueryHandler } from "../../bases/account-query-handler.base";

export class GetChartOfAccountsQuery implements IAccountQuery { }

export abstract class BaseGetChartOfAccountsQueryHandler
    extends BaseAccountQueryHandler<GetChartOfAccountsQuery, ChartOfAccountsDto> { }