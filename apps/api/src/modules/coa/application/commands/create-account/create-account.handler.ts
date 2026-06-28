import { CommandHandler } from "@nestjs/cqrs";
import { AccountMapper } from "../../mappers/account.mapper";
import { AccountDto } from "@repo/coa-contracts";
import { AccountEntity, AccountNameValue, ChartOfAccountsEntity } from "@repo/coa-core";
import { AppliableAccountCommandHandler } from "../../bases/account-command-handler.base";
import { Ensure, UuidValue } from "@repo/shared-core";
import { CreateAccountCommand } from "./create-account.command";
import { firstValueFrom } from "rxjs";

@CommandHandler(CreateAccountCommand)
export class CreateAccountCommandHandler
    extends AppliableAccountCommandHandler<CreateAccountCommand> {

    async execute(command: CreateAccountCommand): Promise<AccountDto> {

        const chart = await firstValueFrom(this.repo.getUnique());

        const account = this.apply(command, chart);

        await firstValueFrom(this.repo.save(chart));

        return AccountMapper.toDto(account);

    }

    apply(command: CreateAccountCommand, chart: ChartOfAccountsEntity): Readonly<AccountEntity> {

        const primitiveData = command.data;
        const id = Ensure.vo('id', () => UuidValue.createOptional(primitiveData.id));
        const name = Ensure.vo('name', () => AccountNameValue.create(primitiveData.name));
        const parentId = Ensure.vo('parentId', () => UuidValue.createOptional(primitiveData.parentId)) ?? null;

        return chart.createAccount({
            ...primitiveData,
            id, name, parentId,
        });
    }
}