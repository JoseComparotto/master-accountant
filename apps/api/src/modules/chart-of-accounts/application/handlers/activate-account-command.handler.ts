import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AccountDomainService, BaseAccountRepository, UuidValue, Ensure } from "@repo/core";
import { AccountFlatDto } from "../types/accounts.types";
import { AccountMapper } from "../mappers/account.mapper";
import { ActivateAccountCommand } from "../commands/activate-account.command";

@CommandHandler(ActivateAccountCommand)
export class ActivateAccountCommandHandler implements ICommandHandler<ActivateAccountCommand> {
    constructor(
        private readonly accountRepository: BaseAccountRepository,
        private readonly accountDomainService: AccountDomainService,
    ) { }

    async execute(command: ActivateAccountCommand): Promise<AccountFlatDto> {
        const id =  Ensure.vo('id', () => UuidValue.create(command.id));

        const account = await this.accountRepository.getById(id);

        this.accountDomainService.activateAccount(account);

        await this.accountRepository.save(account);

        return AccountMapper.toFlatDto(account);
    }
}