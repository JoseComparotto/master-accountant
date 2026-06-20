import { CommandHandler } from "@nestjs/cqrs";
import { AccountNameValue } from "@repo/coa-core";
import { AccountMapper } from "../../mappers/account.mapper";
import { PatchAccountCommand } from "./patch-account.command";
import { AccountDto } from "@repo/coa-contracts";
import { BaseAccountCommandHandler } from "../../bases/account-command-handler.base";
import { Ensure, UuidValue } from "@repo/shared-core";

@CommandHandler(PatchAccountCommand)
export class PatchAccountCommandHandler extends BaseAccountCommandHandler<PatchAccountCommand, AccountDto> {
    async execute(command: PatchAccountCommand): Promise<AccountDto> {
        const chart = await this.getChart(command);

        const { accountId, data: primitiveData } = command;

        const id = Ensure.vo('id', () => UuidValue.create(accountId));
        const name = Ensure.vo('name', () => AccountNameValue.createOptional(primitiveData.name));

        if (name !== undefined)
            chart.updateAccountName(id, name);

        if (primitiveData.description !== undefined)
            chart.updateAccountDescription(id, primitiveData.description);

        if (primitiveData.isContra !== undefined) {
            if (primitiveData.isContra)
                chart.convertToContraAccount(id);
            else
                chart.convertToNormalAccount(id);
        }

        if (primitiveData.isActive !== undefined) {
            if (primitiveData.isActive)
                chart.activateAccount(id)
            else
                chart.inactivateAccount(id)
        }

        await this.repo.save(chart);

        const account = chart.getAccountById(id);
        return AccountMapper.toDto(account, chart);
    }

}