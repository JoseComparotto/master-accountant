import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AccountDomainService, BaseAccountRepository, Ensure, UuidValue } from "@repo/core";
import { AccountMapper } from "../mappers/account.mapper";
import { IUpsertAccountCommandHandler, UpsertAccontResult, UpsertAccountCommand } from "../commands/upsert-account.command";

@CommandHandler(UpsertAccountCommand)
export class UpsertAccountCommandHandler implements IUpsertAccountCommandHandler {
    constructor(
        private readonly accountRepository: BaseAccountRepository,
        private readonly accountDomainService: AccountDomainService,
    ) { }

    async execute(command: UpsertAccountCommand): Promise<UpsertAccontResult> {
        const { data } = command;

        const id = Ensure.vo('id', () => UuidValue.create(command.id));
        const parentId = Ensure.vo('parentId', () => UuidValue.createOptional(data.parentId));

        const existingAccount = await this.accountRepository.findById(id);

        if (existingAccount) {
            await this.accountDomainService.updateAccount(existingAccount, {
                name: data.name,
                description: data.description,
                isContra: data.isContra,
                isActive: data.isActive,
                parentId: data.parentId,
                localIndex: data.localIndex,
                accountClass: data.accountClass,
                isSummary: data.isSummary
            });

            await this.accountRepository.save(existingAccount);
            return {
                action: 'updated',
                account: AccountMapper.toDto(existingAccount)
            };
        }

        const parent = parentId ? await this.accountRepository.getById(parentId) : null;

        const newAccount = await this.accountDomainService.createAccount({
            id: id.value,
            name: data.name,
            description: data.description,
            parent,
            localIndex: data.localIndex,
            accountClass: data.accountClass,
            isSummary: data.isSummary,
            isContra: data.isContra,
            isActive: data.isActive
        });

        await this.accountRepository.save(newAccount);
        return {
            action: 'created',
            account: AccountMapper.toDto(newAccount)
        };
    }
}