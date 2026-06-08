import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AccountDomainService, BaseAccountRepository, UuidValue, Ensure } from "@repo/core";
import { AccountMapper } from "../mappers/account.mapper";
import { ActivateAccountCommand } from "../commands/activate-account.command";
import { AccountDto } from "@repo/contracts";

@CommandHandler(ActivateAccountCommand)
export class ActivateAccountCommandHandler implements ICommandHandler<ActivateAccountCommand> {
    constructor(
        private readonly accountRepository: BaseAccountRepository,
        private readonly accountDomainService: AccountDomainService,
    ) { }

    async execute(command: ActivateAccountCommand): Promise<AccountDto> {
        const id =  Ensure.vo('id', () => UuidValue.create(command.id));

        const account = await this.accountRepository.getById(id);

        this.accountDomainService.activateAccount(account);

        await this.accountRepository.save(account);

        return AccountMapper.toDto(account);
    }
}