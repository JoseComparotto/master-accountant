import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AccountDomainService, AccountRepository } from "@repo/core";
import { AccountFlatDto } from "../types/accounts.types";
import { AccountMapper } from "../mappers/account.mapper";
import { ActivateAccountCommand } from "../commands/activate-account.command";

@CommandHandler(ActivateAccountCommand)
export class ActivateAccountCommandHandler implements ICommandHandler<ActivateAccountCommand> {
    constructor(
        private readonly accountRepository: AccountRepository,
        private readonly accountDomainService: AccountDomainService,
    ) { }

    async execute({ id }: ActivateAccountCommand): Promise<AccountFlatDto> {

        const account = await this.accountRepository.getById(id);

        this.accountDomainService.activateAccount(account);

        await this.accountRepository.save(account);

        return AccountMapper.toFlatDto(account);
    }
}