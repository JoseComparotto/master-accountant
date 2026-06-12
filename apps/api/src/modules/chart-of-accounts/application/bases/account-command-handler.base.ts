import { Inject } from "@nestjs/common";
import { ICommand } from "@nestjs/cqrs";
import { Ensure, UuidValue, type ChartOfAccountsEntity, type IChartOfAccountsRepository } from "@repo/core";

export abstract class BaseAccountCommand implements ICommand {
    constructor(
        public readonly chartId: string,
    ) { }
}

export abstract class BaseAccountCommandHandler<C extends BaseAccountCommand, R = any> {

    constructor(
        @Inject('IChartOfAccountsRepository')
        protected readonly repo: IChartOfAccountsRepository
    ) { }

    abstract execute(command: C): Promise<R>;

    protected getChart(command: C): Promise<ChartOfAccountsEntity> {
        const chartId = Ensure.vo('chartId', () => UuidValue.create(command.chartId));
        return this.repo.getById(chartId);
    }
}

