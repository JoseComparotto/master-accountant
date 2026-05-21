import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EntityManager } from '@mikro-orm/core';
import { CreateDraftChangesetCommand } from '@modules/chart-of-accounts/application/commands/create-draft-changeset.command';
import { ChartOfAccounts } from '@modules/chart-of-accounts/domain/entities/chart-of-accounts.entity';
import { AccountChangeset } from '@modules/chart-of-accounts/domain/entities/account-changeset.entity';

@CommandHandler(CreateDraftChangesetCommand)
export class CreateDraftChangesetHandler implements ICommandHandler<CreateDraftChangesetCommand> {
    constructor(private readonly em: EntityManager) { }

    async execute(command: CreateDraftChangesetCommand): Promise<string> {
        // 1. Carrega a máscara/plano base
        const chart = await this.em.findOneOrFail(ChartOfAccounts, command.chartOfAccountsId);

        // 2. Cria o maestro (Changeset)
        const changeset = AccountChangeset.create(
            command.id,
            chart,
            command.incrementType,
            command.effectiveDate,
        );

        // 3. Salva no banco e retorna a ID para o frontend
        this.em.persist(changeset); // Síncrono (Avisa a memória)
        await this.em.flush();      // Assíncrono (Executa o SQL atômico)

        return changeset.id;
    }
}