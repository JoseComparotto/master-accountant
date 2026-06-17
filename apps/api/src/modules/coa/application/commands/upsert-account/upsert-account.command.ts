import { AccountDto, UpsertAccountInputDto } from "@repo/coa-contracts";
import { BaseAccountCommand, BaseAccountCommandHandler } from "../../bases/account-command-handler.base";

export class UpsertAccountCommand extends BaseAccountCommand {
    constructor(
        public readonly chartId: string,
        public readonly accountId: string,
        public readonly data: UpsertAccountInputDto
    ) {
        super(chartId);
    }
}

export interface UpsertAccontResult {
    action: 'created' | 'updated';
    account: AccountDto;
}

export abstract class BaseUpsertAccountCommandHandler extends BaseAccountCommandHandler<UpsertAccountCommand, UpsertAccontResult>{

}