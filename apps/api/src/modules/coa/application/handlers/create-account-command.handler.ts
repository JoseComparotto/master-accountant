import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AccountMapper } from "../mappers/account.mapper";
import { CreateAccountCommand } from "../commands/create-account.command";
import { AccountDto } from "@repo/coa-contracts";
import { AccountNameValue } from "@repo/coa-core";
import { BaseAccountCommandHandler } from "../bases/account-command-handler.base";
import { Ensure, UuidValue } from "@repo/shared-core";

@CommandHandler(CreateAccountCommand)
export class CreateAccountCommandHandler extends BaseAccountCommandHandler<CreateAccountCommand> {
    async execute(command: CreateAccountCommand): Promise<AccountDto> {

        const primitiveData = command.data;

        const id = Ensure.vo('id', () => UuidValue.createOptional(primitiveData.id));
        const name = Ensure.vo('name', () => AccountNameValue.create(primitiveData.name));
        const parentId = Ensure.vo('parentId', () => UuidValue.createOptional(primitiveData.parentId)) ?? null;

        const chart = await this.getChart(command);

        const account = chart.createAccount({
            ...primitiveData,
            id,
            name,
            parentId,
        });

        await this.repo.save(chart);

        return AccountMapper.toDto(account);

    }
}