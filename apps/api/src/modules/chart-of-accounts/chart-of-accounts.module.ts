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
import { MockAccountRepository } from "./infrastructure/mock/repositories/mock-account.repository";
import { BaseAccountRepository } from "@repo/core";

// Services
import { AccountDomainService, IndexGeneratorService, IHierarchyCheckerService } from "@repo/core";
import { MockHierarchyCheckerService } from "./infrastructure/mock/services/mock-hierarchy-checker.service";

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
        provide: BaseAccountRepository,
        useClass: MockAccountRepository
    }
];

const Services = [
    {
        provide: 'IHierarchyCheckerService',
        useFactory: (repo: BaseAccountRepository) =>
            new MockHierarchyCheckerService(repo),
        inject: [BaseAccountRepository]
    },
    {
        provide: IndexGeneratorService,
        useFactory: (repo: BaseAccountRepository) =>
            new IndexGeneratorService(repo),
        inject: [BaseAccountRepository]
    },
    {
        provide: AccountDomainService,
        useFactory: (
            checker: IHierarchyCheckerService,
        ) => new AccountDomainService(checker),
        inject: ['IHierarchyCheckerService']
    },
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