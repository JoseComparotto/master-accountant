import { CommandHandler } from "@nestjs/cqrs";
import { AccountCommandHandler, IAccountCommand } from "../../bases/account-command-handler.base";
import { CreateAccountCommand } from "../create-account/create-account.command";
import { PatchAccountCommand } from "../patch-account/patch-account.command";
import { firstValueFrom } from "rxjs";
import { ChartOfAccountsEntity, type IChartOfAccountsRepository } from "@repo/coa-core";
import { ChartOfAccountsMapper } from "../../mappers/coa.mapper";
import { UpdateChartOfAccountsResult } from "../update-coa/update-coa.command";
import { CreateAccountCommandHandler } from "../create-account/create-account.handler";
import { Inject } from "@nestjs/common";
import { PatchAccountCommandHandler } from "../patch-account/patch-account.handler";

export type CoaBatchAction = CreateAccountCommand | PatchAccountCommand;

export class ApplyBatchActionsCommand implements IAccountCommand {
    constructor(
        public readonly actions: CoaBatchAction[],
        public readonly expectedVersion: number
    ) { }
}

@CommandHandler(ApplyBatchActionsCommand)
export class ApplyBatchActionsCommandHandler extends AccountCommandHandler<ApplyBatchActionsCommand> {

    constructor(
        @Inject('IChartOfAccountsRepository')
        repo: IChartOfAccountsRepository,
        private createHandler: CreateAccountCommandHandler,
        private patchHandler: PatchAccountCommandHandler,
    ) { super(repo); }

    async execute(command: ApplyBatchActionsCommand): Promise<UpdateChartOfAccountsResult> {

        let chart = await firstValueFrom(this.repo.getUnique());

        const match = chart.version.equals(command.expectedVersion);
        if (match) {
            for (const action of command.actions) {
                if (action instanceof CreateAccountCommand) {
                    this.createHandler.apply(action, chart);
                    continue;
                }

                if (action instanceof PatchAccountCommand) {
                    this.patchHandler.apply(action, chart);
                    continue;
                }

                action satisfies never;
                throw new Error('Comando inválido: ' + action);
            }
            chart = await firstValueFrom(this.repo.save(chart));
        }

        return {
            match,
            chart: ChartOfAccountsMapper.toDto(chart)
        };
    }
}