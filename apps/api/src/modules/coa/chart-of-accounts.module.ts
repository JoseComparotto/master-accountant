import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

// Handlers
import { GetAllAccountsQueryHandler } from "./application/queries/get-all-accounts/get-all-accounts-query.handler";
import { GetAccountsTreeQueryHandler } from "./application/queries/get-accounts-tree/get-accounts-tree.handler";
import { GetAccountByIdQueryHandler } from "./application/queries/get-account-by-id/get-account-by-id.handler";
import { CreateAccountCommandHandler } from "./application/commands/create-account/create-account.handler";
import { PatchAccountCommandHandler } from "./application/commands/patch-account/patch-account.handler";
import { UpsertAccountCommandHandler } from "./application/commands/upsert-account/upsert-account-command.handler";
import { ActivateAccountCommandHandler } from "./application/commands/activate-account/activate-account.handler"
import { InactivateAccountCommandHandler } from "./application/commands/inactivate-account/inactivate-account.handler"

// Controllers
import { AccountsController } from "./presentation/http/controllers/accounts.controller";

// Repositories
import { InMemoryChartOfAccountsRepository } from "./infrastructure/in-memory/repositories/in-memory-chart-of-accounts.repository";

// Services
import { InMemoryAccountQueryService } from "./infrastructure/in-memory/services/in-memory-account-query.service";
import { InMemoryChartOfAccountsFillerService } from "./infrastructure/in-memory/services/in-memory-account-filler.service";
import { InMemoryChartOfAccountsDatabase } from "./infrastructure/in-memory/in-memory.database";

const QueryHandlers = [
    GetAllAccountsQueryHandler,
    GetAccountByIdQueryHandler,
    GetAccountsTreeQueryHandler
];

const CommandHandlers = [
    CreateAccountCommandHandler,
    PatchAccountCommandHandler,
    UpsertAccountCommandHandler,
    InactivateAccountCommandHandler,
    ActivateAccountCommandHandler
];

const Repositories = [
    {
        provide: 'IChartOfAccountsRepository',
        useFactory: (db: InMemoryChartOfAccountsDatabase) => new InMemoryChartOfAccountsRepository(db),
        inject: [InMemoryChartOfAccountsDatabase]
    }
];

const Services = [
    {
        provide: 'IAccountQueryService',
        useClass: InMemoryAccountQueryService
    },
    InMemoryChartOfAccountsFillerService,
    InMemoryChartOfAccountsDatabase
];

@Module({
    imports: [
        CqrsModule
    ],
    controllers: [
        AccountsController
    ],
    providers: [
        ...CommandHandlers,
        ...QueryHandlers,
        ...Repositories,
        ...Services
    ],
})
export class ChartOfAccountsModule { }