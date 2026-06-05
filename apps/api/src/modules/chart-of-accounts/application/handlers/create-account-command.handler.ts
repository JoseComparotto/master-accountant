import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AccountDomainService, AccountRepository, AccountAlreadyExistsException } from "@repo/core";
import { AccountFlatDto } from "../types/accounts.types";
import { AccountMapper } from "../mappers/account.mapper";
import { CreateAccountCommand } from "../commands/create-account.command";

@CommandHandler(CreateAccountCommand)
export class CreateAccountCommandHandler implements ICommandHandler<CreateAccountCommand> {
    constructor(
        private readonly accountRepository: AccountRepository,
        private readonly accountDomainService: AccountDomainService,
    ) { }

    async execute({ data }: CreateAccountCommand): Promise<AccountFlatDto> {

        const existing = data.id ? await this.accountRepository.findById(data.id) : null;
        if(existing) throw new AccountAlreadyExistsException(data.id!);

        const parent = !data.parentId ? null :
            await this.accountRepository.getById(data.parentId!);

        const createProps = {
            ...data,
            parent,
        };

        const account = await this.accountDomainService.createAccount(createProps);

        await this.accountRepository.save(account);

        return AccountMapper.toFlatDto(account);
    }

}