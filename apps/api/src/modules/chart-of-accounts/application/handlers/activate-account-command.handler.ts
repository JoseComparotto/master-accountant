import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Ensure, type IChartOfAccountsRepository, UuidValue } from "@repo/core";
import { AccountMapper } from "../mappers/account.mapper";
import { ActivateAccountCommand } from "../commands/activate-account.command";
import { AccountDto } from "@repo/contracts";
import { BaseAccountCommandHandler } from "../bases/account-command-handler.base";

@CommandHandler(ActivateAccountCommand)
export class ActivateAccountCommandHandler extends BaseAccountCommandHandler<ActivateAccountCommand, AccountDto> {

    async execute(command: ActivateAccountCommand): Promise<AccountDto> {
        const chart = await this.getChart(command);

        const accountId = Ensure.vo('accountId', () => UuidValue.create(command.accountId));

        chart.activateAccount(accountId);

        await this.repo.save(chart);

        const account = chart.getAccountById(accountId);
        return AccountMapper.toDto(account);
    }
}