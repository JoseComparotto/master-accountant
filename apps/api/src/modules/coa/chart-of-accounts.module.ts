import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

// Handlers
import { GetAllAccountsQueryHandler } from "./application/queries/get-all-accounts/get-all-accounts-query.handler";
import { GetAccountByIdQueryHandler } from "./application/queries/get-account-by-id/get-account-by-id.handler";
import { CreateAccountCommandHandler } from "./application/commands/create-account/create-account.handler";
import { PatchAccountCommandHandler } from "./application/commands/patch-account/patch-account.handler";
import { UpsertAccountCommandHandler } from "./application/commands/upsert-account/upsert-account-command.handler";
import { ActivateAccountCommandHandler } from "./application/commands/activate-account/activate-account.handler"
import { InactivateAccountCommandHandler } from "./application/commands/inactivate-account/inactivate-account.handler"

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