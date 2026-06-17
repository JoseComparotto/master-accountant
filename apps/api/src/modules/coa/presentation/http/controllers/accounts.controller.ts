import { Controller } from "@nestjs/common";
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { GetAllAccountsQuery } from "../../../application/queries/get-all-accounts.query";
import { GetAccountByIdQuery } from "../../../application/queries/get-account-by-id.query";
import { CreateAccountCommand } from "../../../application/commands/create-account.command";
import { InactivateAccountCommand } from "../../../application/commands/inactivate-account.command";

import { ActivateAccountCommand } from "../../../application/commands/activate-account.command";
import { PatchAccountCommand } from "../../../application/commands/patch-account.command";
import { AccountDto, apiContract } from "@repo/coa-contracts";

import { tsRestHandler, TsRestHandler } from '@ts-rest/nest'
import { UpsertAccontResult, UpsertAccountCommand } from "../../../application/commands/upsert-account.command";

const DEFAULT_CHART_ID = process.env.DEFAULT_CHART_ID!;

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
        const query = new GetAllAccountsQuery(DEFAULT_CHART_ID);
        const res: AccountDto[] = await this.queryBus.execute(query);
        return { status: 200, body: res };
    };

    async getById({ params: { id } }): Promise<{ status: 200, body: AccountDto }> {
        const query = new GetAccountByIdQuery(DEFAULT_CHART_ID, id);
        const res = await this.queryBus.execute(query);
        return { status: 200, body: res };
    };

    async create({ body }): Promise<{ status: 201, body: AccountDto }> {
        const command = new CreateAccountCommand(DEFAULT_CHART_ID, body);
        const created = await this.commandBus.execute(command);
        return { status: 201, body: created };
    };

    async upsert({ params: { id }, body }): Promise<{ status: 200 | 201, body: AccountDto }> {
        const command = new UpsertAccountCommand(DEFAULT_CHART_ID, id, body);
        const result: UpsertAccontResult = await this.commandBus.execute(command);

        if (result.action === 'created')
            return { status: 201, body: result.account };
        else
            return { status: 200, body: result.account };
    }

    async patch({ params: { id }, body }): Promise<{ status: 200, body: AccountDto }> {
        const command = new PatchAccountCommand(DEFAULT_CHART_ID, id, body);
        const updated: AccountDto = await this.commandBus.execute(command);
        return { status: 200, body: updated };
    };

    async activate({ params: { id } }): Promise<{ status: 200, body: AccountDto }> {
        const command = new ActivateAccountCommand(DEFAULT_CHART_ID, id);
        const activated: AccountDto = await this.commandBus.execute(command);
        return { status: 200, body: activated };
    };

    async inactivate({ params: { id } }): Promise<{ status: 200, body: AccountDto }> {
        const command = new InactivateAccountCommand(DEFAULT_CHART_ID, id);
        const inactivated: AccountDto = await this.commandBus.execute(command);
        return { status: 200, body: inactivated };
    };
}