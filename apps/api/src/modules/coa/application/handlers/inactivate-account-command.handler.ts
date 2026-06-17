import { CommandHandler } from "@nestjs/cqrs";
import { Ensure, UuidValue } from "@repo/shared-core";
import { AccountMapper } from "../mappers/account.mapper";
import { InactivateAccountCommand } from "../commands/inactivate-account.command";
import { AccountDto } from "@repo/coa-contracts";
import { BaseAccountCommandHandler } from "../bases/account-command-handler.base";

@CommandHandler(InactivateAccountCommand)
export class InactivateAccountCommandHandler extends BaseAccountCommandHandler<InactivateAccountCommand, AccountDto> {
    async execute(command: InactivateAccountCommand): Promise<AccountDto> {
        const chart = await this.getChart(command);

        const accountId = Ensure.vo('accountId', () => UuidValue.create(command.accountId));

        chart.inactivateAccount(accountId);

        await this.repo.save(chart);

        const account = chart.getAccountById(accountId);
        return AccountMapper.toDto(account);
    }
}