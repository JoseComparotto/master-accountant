import { Inject } from "@nestjs/common";
import { ICommand } from "@nestjs/cqrs";
import { ChartOfAccountsEntity, type IChartOfAccountsRepository } from "@repo/coa-core";

export interface IAccountCommand extends ICommand {
}

export abstract class AccountCommandHandler<C extends IAccountCommand, R = any> {
    constructor(
        @Inject('IChartOfAccountsRepository')
        protected readonly repo: IChartOfAccountsRepository
    ) { }

    abstract execute(command: C): Promise<R>;
}

export abstract class AppliableAccountCommandHandler<C extends IAccountCommand, R = any, A=any>
    extends AccountCommandHandler<C, R>
{
    abstract execute(command: C): Promise<R>;

    abstract apply(command: C, chart: ChartOfAccountsEntity): A;
}
