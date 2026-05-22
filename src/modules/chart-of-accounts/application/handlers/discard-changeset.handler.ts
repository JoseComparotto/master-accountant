import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EntityManager } from '@mikro-orm/postgresql';
import { DiscardChangesetCommand } from '@modules/chart-of-accounts/application/commands/discard-changeset.command';
import { AccountChangeset } from '@modules/chart-of-accounts/domain/entities/account-changeset.entity';

@CommandHandler(DiscardChangesetCommand)
export class DiscardChangesetHandler implements ICommandHandler<DiscardChangesetCommand> {
  constructor(private readonly em: EntityManager) { }

  async execute(command: DiscardChangesetCommand) {
    const changeset = await this.em.findOneOrFail(AccountChangeset, command.changesetId, {
      populate: ['newNodes', 'newSnapshots', 'transitions']
    });

    changeset.discard(); // Lógica de domínio

    // Limpeza física dos rascunhos para manter a performance da LTree
    if (changeset.newNodes.count() > 0) {
      this.em.remove(changeset.newNodes.getItems());
    }

    await this.em.flush();
  }
}