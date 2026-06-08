import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AccountDomainService, BaseAccountRepository, Ensure, UuidValue } from "@repo/core";
import { AccountMapper } from "../mappers/account.mapper";
import { InactivateAccountCommand } from "../commands/inactivate-account.command";
import { AccountDto } from "@repo/contracts";

@CommandHandler(InactivateAccountCommand)
export class InactivateAccountCommandHandler implements ICommandHandler<InactivateAccountCommand> {
    constructor(
        private readonly accountRepository: BaseAccountRepository,
        private readonly accountDomainService: AccountDomainService,
    ) { }

    async execute(command: InactivateAccountCommand): Promise<AccountDto> {
        const id =  Ensure.vo('id', () => UuidValue.create(command.id));

        const account = await this.accountRepository.getById(id);

        await this.accountDomainService.inactivateAccount(account);

        await this.accountRepository.save(account);

        return AccountMapper.toFlatDto(account);
    }
}