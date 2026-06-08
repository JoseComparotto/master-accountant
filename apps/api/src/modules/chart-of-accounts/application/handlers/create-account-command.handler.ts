import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AccountDomainService, BaseAccountRepository, AccountAlreadyExistsException, UuidValue, Ensure } from "@repo/core";
import { AccountMapper } from "../mappers/account.mapper";
import { CreateAccountCommand } from "../commands/create-account.command";
import { AccountDto } from "@repo/contracts";

@CommandHandler(CreateAccountCommand)
export class CreateAccountCommandHandler implements ICommandHandler<CreateAccountCommand> {
    constructor(
        private readonly accountRepository: BaseAccountRepository,
        private readonly accountDomainService: AccountDomainService,
    ) { }

    async execute({ data }: CreateAccountCommand): Promise<AccountDto> {

        const id =  Ensure.vo('id', () => UuidValue.createOptional(data.id));
        const parentId =  Ensure.vo('parentId', () => UuidValue.createOptional(data.parentId!));

        if (id) {
            const existing = await this.accountRepository.findById(id);
            if (existing) throw new AccountAlreadyExistsException(id);
        }

        const parent = parentId ? await this.accountRepository.getById(parentId) : null;

        const account = await this.accountDomainService.createAccount({
            ...data,
            parent,
            id: id?.value
        });

        await this.accountRepository.save(account);

        return AccountMapper.toFlatDto(account);
    }
}