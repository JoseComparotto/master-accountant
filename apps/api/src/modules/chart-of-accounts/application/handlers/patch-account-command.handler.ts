import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AccountDomainService, AccountRepository, UuidValue, wrapVO } from "@repo/core";
import { AccountFlatDto } from "../types/accounts.types";
import { AccountMapper } from "../mappers/account.mapper";
import { PatchAccountCommand } from "../commands/patch-account.command";

@CommandHandler(PatchAccountCommand)
export class PatchAccountCommandHandler implements ICommandHandler<PatchAccountCommand> {
    constructor(
        private readonly accountRepository: AccountRepository,
        private readonly accountDomainService: AccountDomainService,
    ) { }

    async execute(command: PatchAccountCommand): Promise<AccountFlatDto> {
        const id = wrapVO('id', () => UuidValue.create(command.id));
        const { data } = command;

        const account = await this.accountRepository.getById(id);

        if (data.name !== undefined || data.description !== undefined) {
            this.accountDomainService.patchAccountMetadata(account, {
                name: data.name,
                description: data.description,
            })
        }

        if (data.isContra !== undefined) {
            await this.accountDomainService.applyContraLogic(account, data.isContra)
        }

        if (data.isActive !== undefined) {
            if (data.isActive)
                this.accountDomainService.activateAccount(account)
            else
                await this.accountDomainService.inactivateAccount(account)
        }

        await this.accountRepository.save(account);

        return AccountMapper.toFlatDto(account);
    }

}