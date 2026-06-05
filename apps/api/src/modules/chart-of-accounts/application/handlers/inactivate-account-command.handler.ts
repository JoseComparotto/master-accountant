import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AccountDomainService, AccountRepository } from "@repo/core";
import { AccountFlatDto } from "../types/accounts.types";
import { AccountMapper } from "../mappers/account.mapper";
import { InactivateAccountCommand } from "../commands/inactivate-account.command";

@CommandHandler(InactivateAccountCommand)
export class InactivateAccountCommandHandler implements ICommandHandler<InactivateAccountCommand> {
    constructor(
        private readonly accountRepository: AccountRepository,
        private readonly accountDomainService: AccountDomainService,
    ) { }

    async execute({ id }: InactivateAccountCommand): Promise<AccountFlatDto> {

        const account = await this.accountRepository.getById(id);

        await this.accountDomainService.inactivateAccount(account);

        await this.accountRepository.save(account);

        return AccountMapper.toFlatDto(account);
    }
}