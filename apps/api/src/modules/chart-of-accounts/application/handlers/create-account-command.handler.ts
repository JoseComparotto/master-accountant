import { CommandHandler, ICommandHandler, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AccountDomainService, CreateAccountProps, type IAccountRepository } from "@repo/core";
import { Inject } from "@nestjs/common";
import { AccountFlatDto } from "../types/accounts.types";
import { AccountMapper } from "../mappers/account.mapper";
import { CreateAccountCommand } from "../commands/create-account.command";
import { AccountNotFoundException } from "../exceptions/account-not-found.exception";

@CommandHandler(CreateAccountCommand)
export class CreateAccountCommandHandler implements ICommandHandler<CreateAccountCommand> {
    constructor(
        @Inject('IAccountRepository')
        private readonly accountRepository: IAccountRepository,
        private readonly accountDomainService: AccountDomainService,
    ) { }

    async execute({ data }: CreateAccountCommand): Promise<AccountFlatDto> {

        const parent = !data.parentId ? undefined : await this.findByIdOrThrow(data.parentId!);

        const createProps: CreateAccountProps = {
            ...data,
            parent,
        };

        const account = await this.accountDomainService.createAccount(createProps);

        await this.accountRepository.save(account);

        return AccountMapper.toFlatDto(account);
    }

    private async findByIdOrThrow(id: string) {
        const account = await this.accountRepository.findById(id);
        if (!account) {
            throw new AccountNotFoundException(id);
        }
        return account;
    }
}