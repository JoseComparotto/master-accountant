import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AccountDomainService, AccountRepository, AccountAlreadyExistsException, UuidValue, wrapVO } from "@repo/core";
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

        const id = wrapVO('id', () => UuidValue.createOptional(data.id));
        const parentId = wrapVO('parentId', () => UuidValue.createOptional(data.parentId!));

        if (id) {
            const existing = await this.accountRepository.findById(id);
            if (existing) throw new AccountAlreadyExistsException(id);
        }

        const parent = parentId ? await this.accountRepository.getById(parentId) : null;

        const account = await this.accountDomainService.createAccount({
            ...data,
            id,
            parent,
        });

        await this.accountRepository.save(account);

        return AccountMapper.toFlatDto(account);
    }
}