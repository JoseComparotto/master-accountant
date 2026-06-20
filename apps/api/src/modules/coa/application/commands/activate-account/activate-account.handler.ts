import { CommandHandler } from "@nestjs/cqrs";
import { AccountMapper } from "../../mappers/account.mapper";
import { AccountDto } from "@repo/coa-contracts";
import { BaseAccountCommandHandler } from "../../bases/account-command-handler.base";
import { Ensure, UuidValue } from "@repo/shared-core";
import { ActivateAccountCommand } from "./activate-account.command";

@CommandHandler(ActivateAccountCommand)
export class ActivateAccountCommandHandler extends BaseAccountCommandHandler<ActivateAccountCommand, AccountDto> {

    async execute(command: ActivateAccountCommand): Promise<AccountDto> {
        const chart = await this.getChart(command);

        const accountId = Ensure.vo('accountId', () => UuidValue.create(command.accountId));

        chart.activateAccount(accountId);

        await this.repo.save(chart);

        const account = chart.getAccountById(accountId);
        return AccountMapper.toDto(account, chart);
    }
}