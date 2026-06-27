import { AccountDto, ChartOfAccountsDto, UpdateChartOfAccountsInputDto, UpsertAccountInputDto } from "@repo/coa-contracts";
import { IAccountCommand, BaseAccountCommandHandler } from "../../bases/account-command-handler.base";

export class UpdateChartOfAccountsCommand implements IAccountCommand {
    constructor(
        public readonly data: UpdateChartOfAccountsInputDto,
        public readonly expectedVersion: number
    ) { }
}

export interface UpdateChartOfAccountsResult {
    match: boolean;
    chart: ChartOfAccountsDto;
};

export abstract class BaseUpdateChartOfAccountsCommandHandler
    extends BaseAccountCommandHandler<UpdateChartOfAccountsCommand, UpdateChartOfAccountsResult> {

}