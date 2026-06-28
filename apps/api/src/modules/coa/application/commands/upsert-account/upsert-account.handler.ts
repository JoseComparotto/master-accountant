import { CommandHandler } from "@nestjs/cqrs";
import { AccountEntity, AccountNameValue } from "@repo/coa-core";
import { AccountMapper } from "../../mappers/account.mapper";
import {
    BaseUpsertAccountCommandHandler,
    UpsertAccountResult,
    UpsertAccountCommand
} from "./upsert-account.command";
import { Ensure, UuidValue } from "@repo/shared-core";
import { firstValueFrom } from "rxjs";

@CommandHandler(UpsertAccountCommand)
export class UpsertAccountCommandHandler extends BaseUpsertAccountCommandHandler {
    async execute(command: UpsertAccountCommand): Promise<UpsertAccountResult> {
        const chart = await firstValueFrom(this.repo.getUnique());

        const { accountId, data: primitiveData } = command;

        const id = Ensure.vo('id', () => UuidValue.create(accountId));
        const name = Ensure.vo('name', () => AccountNameValue.create(primitiveData.name));
        const parentId = Ensure.vo('parentId', () => UuidValue.createOptional(primitiveData.parentId)) ?? null;

        if (chart.hasAccountId(id)) {
            const updated: Readonly<AccountEntity> = chart.updateAccount(id, {
                ...primitiveData,
                name, parentId,
            });

            await firstValueFrom(this.repo.save(chart));
            return {
                action: 'updated',
                account: AccountMapper.toDto(updated)
            };
        }

        const created = chart.createAccount({
            ...primitiveData,
            id, name, parentId
        });

        await firstValueFrom(this.repo.save(chart));
        return {
            action: 'created',
            account: AccountMapper.toDto(created)
        };
    }
}