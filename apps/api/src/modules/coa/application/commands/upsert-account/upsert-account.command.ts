import { AccountDto, UpsertAccountInputDto } from "@repo/coa-contracts";
import { IAccountCommand, AccountCommandHandler } from "../../bases/account-command-handler.base";

export class UpsertAccountCommand implements IAccountCommand {
    constructor(
        public readonly accountId: string,
        public readonly data: UpsertAccountInputDto
    ) { }
}

export interface UpsertAccountResult {
    action: 'created' | 'updated';
    account: AccountDto;
}

export abstract class BaseUpsertAccountCommandHandler extends AccountCommandHandler<UpsertAccountCommand, UpsertAccountResult>{

}