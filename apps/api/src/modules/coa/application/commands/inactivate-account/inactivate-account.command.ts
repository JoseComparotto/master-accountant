import { IAccountCommand } from "../../bases/account-command-handler.base";

export class InactivateAccountCommand implements IAccountCommand {
    constructor(
        public readonly accountId: string
    ) { }
}