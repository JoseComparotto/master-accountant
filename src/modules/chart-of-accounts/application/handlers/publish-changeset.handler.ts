// src/application/handlers/publish-changeset.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EntityManager } from '@mikro-orm/postgresql';
import { PublishChangesetCommand } from '@modules/chart-of-accounts/application/commands/publish-changeset.command';
import { AccountChangeset } from '@modules/chart-of-accounts/domain/entities/account-changeset.entity';

@CommandHandler(PublishChangesetCommand)
export class PublishChangesetHandler implements ICommandHandler<PublishChangesetCommand> {
  constructor(private readonly em: EntityManager) { }

  async execute(command: PublishChangesetCommand): Promise<void> {
    // 1. Carrega o Changeset trazendo junto todos os Snapshots que ele contém
    const changeset = await this.em.findOneOrFail(AccountChangeset, command.changesetId
      , { populate: ['transitions', 'newSnapshots', 'newSnapshots.node'] });

    // 2. Regra de Negócio: O Changeset carimba a data efetiva e muda seu status
    changeset.publish(command.effectiveDate);

    // 3. Atualiza os ponteiros de SSoT: A árvore agora aponta para os novos Snapshots
    for (const snapshot of changeset.newSnapshots) {
      const node = snapshot.node;

      node.updateVersion(snapshot);
    }

    // 4. Salva a transação inteira de forma atômica
    await this.em.flush();
  }
}