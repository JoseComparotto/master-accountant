import { Inject } from "@nestjs/common";
import { ICommand } from "@nestjs/cqrs";
import { type IChartOfAccountsRepository } from "@repo/coa-core";

export interface IAccountCommand extends ICommand {
}

export abstract class BaseAccountCommandHandler<C extends IAccountCommand, R = any> {
    constructor(
        @Inject('IChartOfAccountsRepository')
        protected readonly repo: IChartOfAccountsRepository
    ) { }

    abstract execute(command: C): Promise<R>;
}

