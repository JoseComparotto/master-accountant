import { IAccountCommand } from "../../bases/account-command-handler.base";

export class ActivateAccountCommand implements IAccountCommand {
    constructor(
        public readonly accountId: string
    ) { }
}