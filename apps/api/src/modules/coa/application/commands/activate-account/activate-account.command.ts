import { BaseAccountCommand } from "../../bases/account-command-handler.base";

export class ActivateAccountCommand extends BaseAccountCommand {
    constructor(
        public readonly chartId: string,
        public readonly accountId: string
    ) {
        super(chartId);
    }
}