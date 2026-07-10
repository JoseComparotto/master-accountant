import { AccountDto, ReplaceAccountInputDto } from "../../../presentation/http/dtos/accounts.dto";
import { IAccountCommand, AccountCommandHandler } from "../../bases/account-command-handler.base";

export class ReplaceAccountsCommand implements IAccountCommand {
    constructor(
        public readonly accounts: ReplaceAccountInputDto[]
    ) { }
}

export interface ReplaceAccountsResult {
    accounts: AccountDto[];
}

export abstract class BaseReplaceAccountsCommandHandler
    extends AccountCommandHandler<ReplaceAccountsCommand, ReplaceAccountsResult> { }