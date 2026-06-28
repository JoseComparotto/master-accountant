import { AccountDto, ReplaceAccountsInputDto } from "@repo/coa-contracts";
import { IAccountCommand, AccountCommandHandler } from "../../bases/account-command-handler.base";

export class ReplaceAccountsCommand implements IAccountCommand {
    constructor(
        public readonly accounts: ReplaceAccountsInputDto
    ) { }
}

export interface ReplaceAccountsResult {
    accounts: AccountDto[];
}

export abstract class BaseReplaceAccountsCommandHandler
    extends AccountCommandHandler<ReplaceAccountsCommand, ReplaceAccountsResult> { }