import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

// Handlers
import { GetAllAccountsQueryHandler } from "./application/handlers/get-all-accounts-query.handler";
import { GetAccountByIdQueryHandler } from "./application/handlers/get-account-by-id-query.handler";
import { CreateAccountCommandHandler } from "./application/handlers/create-account-command.handler";
import { PatchAccountCommandHandler } from "./application/handlers/patch-account-command.handler";
import { UpsertAccountCommandHandler } from "./application/handlers/upsert-account-command.handler";
import { ActivateAccountCommandHandler } from "./application/handlers/activate-account-command.handler"
import { InactivateAccountCommandHandler } from "./application/handlers/inactivate-account-command.handler"

// Controllers
import { AccountsController } from "./presentation/http/controllers/accounts.controller";

// Repositories
import { MockChartOfAccountsRepository } from "./infrastructure/mock/repositories/mock-chart-of-accounts.repository";

// Services

const QueryHandlers = [
    GetAllAccountsQueryHandler,
    GetAccountByIdQueryHandler,
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
        useClass: MockChartOfAccountsRepository
    }
];

const Services = [
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