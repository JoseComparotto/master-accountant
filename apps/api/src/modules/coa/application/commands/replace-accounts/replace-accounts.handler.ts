import { CommandHandler } from "@nestjs/cqrs";
import { AccountEntity, AccountNameValue, UpdateAccountsInput } from "@repo/coa-core";
import { AccountMapper } from "../../mappers/account.mapper";
import { Ensure, UuidValue } from "@repo/shared-core";
import {
    BaseReplaceAccountsCommandHandler,
    ReplaceAccountsCommand,
    ReplaceAccountsResult
} from "./replace-accounts.command";
import { firstValueFrom } from "rxjs";

@CommandHandler(ReplaceAccountsCommand)
export class ReplaceAccountsCommandHandler extends BaseReplaceAccountsCommandHandler {
    async execute(command: ReplaceAccountsCommand): Promise<ReplaceAccountsResult> {
        const chart = await firstValueFrom(this.repo.getUnique());

        const { accounts } = command;

        const newAccounts = chart.updateAccounts(
            accounts.map<UpdateAccountsInput[number]>(a => ({
                id: Ensure.vo('id', () => UuidValue.createOptional(a.id)),
                parentId: Ensure.vo('parentId', () => UuidValue.createOptional(a.parentId)) ?? null,
                name: AccountNameValue.create(a.name),

                description: a.description,
                localIndex: a.localIndex,
                accountClass: a.accountClass,
                isSummary: a.isSummary,
                isContra: a.isContra,
                isActive: a.isActive,
            }))
        );
        
        await firstValueFrom(this.repo.save(chart));

        return {
            accounts: newAccounts.map(a => AccountMapper.toDto(a, chart))
        }
    }
}