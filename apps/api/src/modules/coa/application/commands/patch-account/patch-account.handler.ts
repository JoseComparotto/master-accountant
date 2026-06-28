import { CommandHandler } from "@nestjs/cqrs";
import { AccountEntity, AccountNameValue, ChartOfAccountsEntity } from "@repo/coa-core";
import { AccountMapper } from "../../mappers/account.mapper";
import { PatchAccountCommand } from "./patch-account.command";
import { AccountDto } from "@repo/coa-contracts";
import { AppliableAccountCommandHandler } from "../../bases/account-command-handler.base";
import { Ensure, UuidValue } from "@repo/shared-core";
import { firstValueFrom } from "rxjs";

@CommandHandler(PatchAccountCommand)
export class PatchAccountCommandHandler
    extends AppliableAccountCommandHandler<PatchAccountCommand, AccountDto> {
    async execute(command: PatchAccountCommand): Promise<AccountDto> {
        const chart = await firstValueFrom(this.repo.getUnique());

        const account = this.apply(command, chart);

        await firstValueFrom(this.repo.save(chart));

        return AccountMapper.toDto(account);
    }

    apply(command: PatchAccountCommand, chart: ChartOfAccountsEntity): Readonly<AccountEntity> {
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

        return chart.getAccountById(id);
    }

}