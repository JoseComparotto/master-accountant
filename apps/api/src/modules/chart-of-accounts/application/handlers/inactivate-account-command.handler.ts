import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AccountDomainService, type IAccountRepository } from "@repo/core";
import { Inject } from "@nestjs/common";
import { AccountFlatDto } from "../types/accounts.types";
import { AccountMapper } from "../mappers/account.mapper";
import { InactivateAccountCommand } from "../commands/inactivate-account.command";
import { AccountAppService } from "../services/account-app.service";

@CommandHandler(InactivateAccountCommand)
export class InactivateAccountCommandHandler implements ICommandHandler<InactivateAccountCommand> {
    constructor(
        @Inject('IAccountRepository')
        private readonly accountRepository: IAccountRepository,
        private readonly accountAppService: AccountAppService,
        private readonly accountDomainService: AccountDomainService,
    ) { }

    async execute({ id }: InactivateAccountCommand): Promise<AccountFlatDto> {

        const account = await this.accountAppService.getById(id);

        this.accountDomainService.inactivateAccount(account);

        await this.accountRepository.save(account);

        return AccountMapper.toFlatDto(account);
    }
}