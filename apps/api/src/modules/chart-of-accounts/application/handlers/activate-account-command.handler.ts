import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AccountDomainService, type IAccountRepository } from "@repo/core";
import { Inject } from "@nestjs/common";
import { AccountFlatDto } from "../types/accounts.types";
import { AccountMapper } from "../mappers/account.mapper";
import { ActivateAccountCommand } from "../commands/activate-account.command";
import { AccountAppService } from "../services/account-app.service";

@CommandHandler(ActivateAccountCommand)
export class ActivateAccountCommandHandler implements ICommandHandler<ActivateAccountCommand> {
    constructor(
        @Inject('IAccountRepository')
        private readonly accountRepository: IAccountRepository,
        private readonly accountAppService: AccountAppService,
        private readonly accountDomainService: AccountDomainService,
    ) { }

    async execute({ id }: ActivateAccountCommand): Promise<AccountFlatDto> {

        const account = await this.accountAppService.getById(id);

        this.accountDomainService.activateAccount(account);

        await this.accountRepository.save(account);

        return AccountMapper.toFlatDto(account);
    }
}