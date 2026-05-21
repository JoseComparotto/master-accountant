import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CqrsModule } from '@nestjs/cqrs';

// 1. Entidades (Domain)
import { ChartOfAccounts } from '@modules/chart-of-accounts/domain/entities/chart-of-accounts.entity';
import { AccountNode } from '@modules/chart-of-accounts/domain/entities/account-node.entity';
import { AccountSnapshot } from '@modules/chart-of-accounts/domain/entities/account-snapshot.entity';
import { AccountChangeset } from '@modules/chart-of-accounts/domain/entities/account-changeset.entity';
import { AccountTransition } from '@modules/chart-of-accounts/domain/entities/account-transition.entity';

// 2. Controladores HTTP (Infrastructure)
import { AccountsController } from '@modules/chart-of-accounts/infrastructure/http/controllers/accounts.controller';
import { ChangesetsController } from '@modules/chart-of-accounts/infrastructure/http/controllers/changesets.controller';
import { ChartsOfAccountsController } from '@modules/chart-of-accounts/infrastructure/http/controllers/charts-of-accounts.controller';

// 3. Handlers do CQRS (Application)
import { CreateDraftChangesetHandler } from '@modules/chart-of-accounts/application/handlers/create-draft-changeset.handler';
import { PublishChangesetHandler } from '@modules/chart-of-accounts/application/handlers/publish-changeset.handler';
import { CreateChartOfAccountHandler } from '@modules/chart-of-accounts/application/handlers/create-chart-of-account.handler';
import { GetAllAccountsForChartHandler } from '@/modules/chart-of-accounts/application/handlers/get-all-accounts-for-chart.handler';
import { GetAllChartsOfAccountsHandler } from '@modules/chart-of-accounts/application/handlers/get-all-charts-of-accounts.handler';

// Agrupar handlers em arrays mantém o providers limpo
const CommandHandlers = [
  CreateDraftChangesetHandler, 
  PublishChangesetHandler,
  CreateChartOfAccountHandler
];
const QueryHandlers = [
  GetAllAccountsForChartHandler,
  GetAllChartsOfAccountsHandler
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
    ChartsOfAccountsController,
  ],
  providers: [
    // Todos os comandos e queries viram providers injetáveis do NestJS
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class ChartOfAccountsModule {}