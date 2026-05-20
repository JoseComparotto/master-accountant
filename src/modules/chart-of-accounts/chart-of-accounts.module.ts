import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CqrsModule } from '@nestjs/cqrs';

// 1. Entidades (Domain)
import { ChartOfAccounts } from './domain/entities/chart-of-accounts.entity';
import { AccountNode } from './domain/entities/account-node.entity';
import { AccountSnapshot } from './domain/entities/account-snapshot.entity';
import { AccountChangeset } from './domain/entities/account-changeset.entity';
import { AccountTransition } from './domain/entities/account-transition.entity';

// 2. Controladores HTTP (Infrastructure)
import { AccountsController } from './infrastructure/http/controllers/accounts.controller';
import { ChangesetsController } from './infrastructure/http/controllers/changesets.controller';

// 3. Handlers do CQRS (Application)
import { CreateDraftChangesetHandler } from './application/handlers/create-draft-changeset.handler';
import { PublishChangesetHandler } from './application/handlers/publish-changeset.handler';
import { GetAccountTreeHandler } from './application/handlers/get-account-tree.handler';

// Agrupar handlers em arrays mantém o providers limpo
const CommandHandlers = [
  CreateDraftChangesetHandler, 
  PublishChangesetHandler
];
const QueryHandlers = [
  GetAccountTreeHandler
];

@Module({
  imports: [
    // Ativa os barramentos CommandBus e QueryBus neste módulo
    CqrsModule, 
    
    // Registra as entidades no escopo deste módulo.
    // Permite que os Handlers usem a injeção de dependência do EntityManager.
    MikroOrmModule.forFeature([
      ChartOfAccounts,
      AccountNode,
      AccountSnapshot,
      AccountChangeset,
      AccountTransition,
    ]),
  ],
  controllers: [
    AccountsController,
    ChangesetsController,
  ],
  providers: [
    // Todos os comandos e queries viram providers injetáveis do NestJS
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class ChartOfAccountsModule {}