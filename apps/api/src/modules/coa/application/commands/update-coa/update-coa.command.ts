import { ChartOfAccountsDto, UpdateChartOfAccountsInputDto } from "../../../presentation/http/dtos/coa.dto";
import { IAccountCommand, AccountCommandHandler } from "../../bases/account-command-handler.base";

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
    extends AccountCommandHandler<UpdateChartOfAccountsCommand, UpdateChartOfAccountsResult> {

}