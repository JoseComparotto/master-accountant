import { ICommand, ICommandHandler } from "@nestjs/cqrs";
import { AccountDto, UpsertAccountInputDto } from "@repo/contracts";

export class UpsertAccountCommand implements ICommand {
    constructor(
        public readonly id: string,
        public readonly data: UpsertAccountInputDto
    ) {}
}

export interface UpsertAccontResult {
    action: 'created' | 'updated';
    account: AccountDto;
}

export interface IUpsertAccountCommandHandler extends ICommandHandler<UpsertAccountCommand>{
    execute(command: UpsertAccountCommand): Promise<UpsertAccontResult>;
}