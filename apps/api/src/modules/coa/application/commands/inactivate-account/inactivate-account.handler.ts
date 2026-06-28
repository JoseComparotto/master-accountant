import { CommandHandler } from "@nestjs/cqrs";
import { Ensure, UuidValue } from "@repo/shared-core";
import { AccountMapper } from "../../mappers/account.mapper";
import { AccountDto } from "@repo/coa-contracts";
import { AccountCommandHandler } from "../../bases/account-command-handler.base";
import { InactivateAccountCommand } from "./inactivate-account.command";
import { firstValueFrom } from "rxjs";

@CommandHandler(InactivateAccountCommand)
export class InactivateAccountCommandHandler extends AccountCommandHandler<InactivateAccountCommand, AccountDto> {
    async execute(command: InactivateAccountCommand): Promise<AccountDto> {
        const chart = await firstValueFrom(this.repo.getUnique());

        const accountId = Ensure.vo('accountId', () => UuidValue.create(command.accountId));

        chart.inactivateAccount(accountId);

        await firstValueFrom(this.repo.save(chart));

        const account = chart.getAccountById(accountId);
        return AccountMapper.toDto(account);
    }
}