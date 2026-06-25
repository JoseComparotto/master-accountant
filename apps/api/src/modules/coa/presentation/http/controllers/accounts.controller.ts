import { Controller } from "@nestjs/common";
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { GetAllAccountsQuery } from "../../../application/queries/get-all-accounts/get-all-accounts.query";
import { GetAccountsTreeQuery } from "../../../application/queries/get-accounts-tree/get-accounts-tree.query";
import { GetAccountByIdQuery } from "../../../application/queries/get-account-by-id/get-account-by-id.query";

import { AccountDto, AccountNodeDto, apiContract } from "@repo/coa-contracts";

import { tsRestHandler, TsRestHandler } from '@ts-rest/nest'
import { ActivateAccountCommand } from "../../../application/commands/activate-account/activate-account.command";
import { CreateAccountCommand } from "../../../application/commands/create-account/create-account.command";
import { InactivateAccountCommand } from "../../../application/commands/inactivate-account/inactivate-account.command";
import { PatchAccountCommand } from "../../../application/commands/patch-account/patch-account.command";
import { UpsertAccountCommand, UpsertAccontResult } from "../../../application/commands/upsert-account/upsert-account.command";

@Controller()
export class AccountsController {

    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
    ) { }

    @TsRestHandler(apiContract.accounts)
    async handleAccounts() {
        return tsRestHandler(apiContract.accounts, this);
    }

    async getAll(): Promise<{ status: 200, body: AccountDto[] }> {
        const query = new GetAllAccountsQuery();
        const res: AccountDto[] = await this.queryBus.execute(query);
        return { status: 200, body: res };
    };

    async getTree(): Promise<{status: 200, body: AccountNodeDto[]}>{
        const query = new GetAccountsTreeQuery();
        const res: AccountNodeDto[] = await this.queryBus.execute(query);
        return { status: 200, body: res };        
    }

    async getById({ params: { id } }): Promise<{ status: 200, body: AccountDto }> {
        const query = new GetAccountByIdQuery(id);
        const res = await this.queryBus.execute(query);
        return { status: 200, body: res };
    };

    async create({ body }): Promise<{ status: 201, body: AccountDto }> {
        const command = new CreateAccountCommand(body);
        const created = await this.commandBus.execute(command);
        return { status: 201, body: created };
    };

    async upsert({ params: { id }, body }): Promise<{ status: 200 | 201, body: AccountDto }> {
        const command = new UpsertAccountCommand(id, body);
        const result: UpsertAccontResult = await this.commandBus.execute(command);

        if (result.action === 'created')
            return { status: 201, body: result.account };
        else
            return { status: 200, body: result.account };
    }

    async patch({ params: { id }, body }): Promise<{ status: 200, body: AccountDto }> {
        const command = new PatchAccountCommand(id, body);
        const updated: AccountDto = await this.commandBus.execute(command);
        return { status: 200, body: updated };
    };

    async activate({ params: { id } }): Promise<{ status: 200, body: AccountDto }> {
        const command = new ActivateAccountCommand(id);
        const activated: AccountDto = await this.commandBus.execute(command);
        return { status: 200, body: activated };
    };

    async inactivate({ params: { id } }): Promise<{ status: 200, body: AccountDto }> {
        const command = new InactivateAccountCommand(id);
        const inactivated: AccountDto = await this.commandBus.execute(command);
        return { status: 200, body: inactivated };
    };
}