import { CommandHandler } from "@nestjs/cqrs";
import { AccountMapper } from "../../mappers/account.mapper";
import { AccountDto } from "@repo/coa-contracts";
import { AccountCommandHandler } from "../../bases/account-command-handler.base";
import { Ensure, UuidValue } from "@repo/shared-core";
import { ActivateAccountCommand } from "./activate-account.command";
import { firstValueFrom } from "rxjs";

@CommandHandler(ActivateAccountCommand)
export class ActivateAccountCommandHandler extends AccountCommandHandler<ActivateAccountCommand, AccountDto> {

    async execute(command: ActivateAccountCommand): Promise<AccountDto> {
        const chart = await firstValueFrom(this.repo.getUnique());

        const accountId = Ensure.vo('accountId', () => UuidValue.create(command.accountId));

        chart.activateAccount(accountId);

        await firstValueFrom(this.repo.save(chart));

        const account = chart.getAccountById(accountId);
        return AccountMapper.toDto(account);
    }
}