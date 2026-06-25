import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

// Handlers
import { GetAllAccountsQueryHandler } from "./application/queries/get-all-accounts/get-all-accounts-query.handler";
import { GetAccountsTreeQueryHandler } from "./application/queries/get-accounts-tree/get-accounts-tree.handler";
import { GetAccountByIdQueryHandler } from "./application/queries/get-account-by-id/get-account-by-id.handler";
import { CreateAccountCommandHandler } from "./application/commands/create-account/create-account.handler";
import { PatchAccountCommandHandler } from "./application/commands/patch-account/patch-account.handler";
import { UpsertAccountCommandHandler } from "./application/commands/upsert-account/upsert-account.handler";
import { ActivateAccountCommandHandler } from "./application/commands/activate-account/activate-account.handler"
import { InactivateAccountCommandHandler } from "./application/commands/inactivate-account/inactivate-account.handler"

// Controllers
import { AccountsController } from "./presentation/http/controllers/accounts.controller";

// Services
import { AccountQueryService } from "./application/services/account-query.service";
import { CoaDatabaseModule } from "./infrastructure/db";

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

const Services = [
    {
        provide: 'IAccountQueryService',
        useFactory: repo => new AccountQueryService(repo),
        inject: ['IChartOfAccountsRepository']
    }
];

@Module({
    imports: [
        CqrsModule,
        CoaDatabaseModule
    ],
    controllers: [
        AccountsController
    ],
    providers: [
        ...CommandHandlers,
        ...QueryHandlers,
        ...Services
    ],
})
export class ChartOfAccountsModule { }