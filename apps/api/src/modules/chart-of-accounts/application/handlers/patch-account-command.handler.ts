import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AccountDomainService, type IAccountRepository } from "@repo/core";
import { Inject } from "@nestjs/common";
import { AccountFlatDto } from "../types/accounts.types";
import { AccountMapper } from "../mappers/account.mapper";
import { PatchAccountCommand } from "../commands/patch-account.command";
import { AccountAppService } from "../services/account-app.service";

@CommandHandler(PatchAccountCommand)
export class PatchAccountCommandHandler implements ICommandHandler<PatchAccountCommand> {
    constructor(
        @Inject('IAccountRepository')
        private readonly accountRepository: IAccountRepository,
        private readonly accountAppService: AccountAppService,
        private readonly accountDomainService: AccountDomainService,
    ) { }

    async execute({ id, data }: PatchAccountCommand): Promise<AccountFlatDto> {

        const account = await this.accountAppService.getById(id);

        if (data.name !== undefined || data.description !== undefined) {
            this.accountDomainService.patchAccountMetadata(account, {
                name: data.name,
                description: data.description,
            })
        }

        if(data.isContra !== undefined){
            await this.accountDomainService.applyContraLogic(account, data.isContra)
        }

        if (data.isActive !== undefined) {
            if (data.isActive)
                this.accountDomainService.activateAccount(account)
            else
                this.accountDomainService.inactivateAccount(account)
        }

        await this.accountRepository.save(account);

        return AccountMapper.toFlatDto(account);
    }

}