import { AccountDto, UpsertAccountInputDto } from "@repo/coa-contracts";
import { IAccountCommand, BaseAccountCommandHandler } from "../../bases/account-command-handler.base";

export class UpsertAccountCommand implements IAccountCommand {
    constructor(
        public readonly accountId: string,
        public readonly data: UpsertAccountInputDto
    ) { }
}

export interface UpsertAccontResult {
    action: 'created' | 'updated';
    account: AccountDto;
}

export abstract class BaseUpsertAccountCommandHandler extends BaseAccountCommandHandler<UpsertAccountCommand, UpsertAccontResult>{

}