import { CommandHandler } from "@nestjs/cqrs";
import { BaseUpdateChartOfAccountsCommandHandler, UpdateChartOfAccountsCommand, UpdateChartOfAccountsResult } from "./update-coa.command";
import { firstValueFrom } from "rxjs";
import { ChartOfAccountsMapper } from "../../mappers/coa.mapper";
import { AccountNameValue, UpdateAccountsInput } from "@repo/coa-core";
import { Ensure, UuidValue } from "@repo/shared-core";

@CommandHandler(UpdateChartOfAccountsCommand)
export class UpdateChartOfAccountsCommandHandler extends BaseUpdateChartOfAccountsCommandHandler {
    async execute(command: UpdateChartOfAccountsCommand): Promise<UpdateChartOfAccountsResult> {
        const { data, expectedVersion } = command;

        let chart = await firstValueFrom(this.repo.getUnique());
        const match = chart.version.equals(expectedVersion);

        if (match) {

            const accounts = data.accounts.map<UpdateAccountsInput[number]>(a => ({
                id: Ensure.vo('id', () => UuidValue.createOptional(a.id)),
                parentId: Ensure.vo('parentId', () => UuidValue.createOptional(a.parentId)) ?? null,
                name: AccountNameValue.create(a.name),

                description: a.description,
                localIndex: a.localIndex,
                accountClass: a.accountClass,
                isSummary: a.isSummary,
                isContra: a.isContra,
                isActive: a.isActive,
            }));

            chart.updateAccounts(accounts);

            chart = await firstValueFrom(this.repo.save(chart));
        }

        return {
            chart: ChartOfAccountsMapper.toDto(chart),
            match
        };
    }

}