import { CommandHandler } from "@nestjs/cqrs";
import { AccountEntity, AccountNameValue, Ensure, UuidValue } from "@repo/core";
import { AccountMapper } from "../mappers/account.mapper";
import { BaseUpsertAccountCommandHandler, UpsertAccontResult, UpsertAccountCommand } from "../commands/upsert-account.command";

@CommandHandler(UpsertAccountCommand)
export class UpsertAccountCommandHandler extends BaseUpsertAccountCommandHandler {
    async execute(command: UpsertAccountCommand): Promise<UpsertAccontResult> {
        const chart = await this.getChart(command);

        const { accountId, data: primitiveData } = command;

        const id = Ensure.vo('id', () => UuidValue.create(accountId));
        const name = Ensure.vo('name', () => AccountNameValue.create(primitiveData.name));
        const parentId = Ensure.vo('parentId', () => UuidValue.createOptional(primitiveData.parentId)) ?? null;

        if (chart.hasAccountId(id)) {
            const updated: Readonly<AccountEntity> = chart.updateAccount(id, {
                ...primitiveData,
                name, parentId
            });

            await this.repo.save(chart);
            return {
                action: 'updated',
                account: AccountMapper.toDto(updated)
            };
        }

        const created = chart.createAccount({
            ...primitiveData,
            id, name, parentId            
        });

        await this.repo.save(chart);
        return {
            action: 'created',
            account: AccountMapper.toDto(created)
        };
    }
}