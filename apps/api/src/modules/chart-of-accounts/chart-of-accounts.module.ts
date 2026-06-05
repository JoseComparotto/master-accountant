import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

// Handlers
import { GetAllAccountsQueryHandler } from "./application/handlers/get-all-accounts-query.handler";
import { GetAccountByIdQueryHandler } from "./application/handlers/get-account-by-id-query.handler";
import { CreateAccountCommandHandler } from "./application/handlers/create-account-command.handler";
import { PatchAccountCommandHandler } from "./application/handlers/patch-account-command.handler";
import { ActivateAccountCommandHandler } from "./application/handlers/activate-account-command.handler"
import { InactivateAccountCommandHandler } from "./application/handlers/inactivate-account-command.handler"

// Controllers
import { AccountsController } from "./presentation/http/controllers/accounts.controller";

// Repositories
import { MockAccountRepository } from "./infrastructure/mock/repositories/mock-account.repository";
import { IAccountRepository } from "@repo/core";

// Services
import { AccountDomainService, IHierarchyCheckerService, HierarchyCheckerService } from "@repo/core";
import { AccountAppService } from "./application/services/account-app.service";

const QueryHandlers = [
    GetAllAccountsQueryHandler,
    GetAccountByIdQueryHandler,
];

const CommandHandlers = [
    CreateAccountCommandHandler,
    PatchAccountCommandHandler,
    InactivateAccountCommandHandler,
    ActivateAccountCommandHandler
];

const Repositories = [
    {
        provide: 'IAccountRepository',
        useClass: MockAccountRepository,
    }
];

const Services = [
    {
        provide: 'IHierarchyCheckerService',
        useFactory: (
            repo: IAccountRepository
        ) => new HierarchyCheckerService(repo),
        inject: ['IAccountRepository']
    },
    {
        provide: AccountDomainService,
        useFactory: (
            checker: IHierarchyCheckerService,
            repo: IAccountRepository
        ) => new AccountDomainService(checker, repo),
        inject: [ 'IHierarchyCheckerService', 'IAccountRepository']
    },
    AccountAppService,
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