import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { GetAllAccountsQuery } from "../../../application/queries/get-all-accounts.query";
import { GetAccountByIdQuery } from "../../../application/queries/get-account-by-id.query";
import { CreateAccountCommand } from "../../../application/commands/create-account.command";
import { InactivateAccountCommand } from "../../../application/commands/inactivate-account.command";

import { AccountResponseDto } from "../dtos/account-response.dto";
import { CreateAccountRequestDto } from "../dtos/create-account-request.dto";
import { ActivateAccountCommand } from "../../../application/commands/activate-account.command";

// TODO: Implementar swagger
@Controller('accounts')
export class AccountsController {

    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
    ) { }

    // GET /accounts
    @Get()
    async getAllAccounts(): Promise<AccountResponseDto[]> {
        return this.queryBus.execute(new GetAllAccountsQuery());
    }

    // GET /accounts/:id
    @Get(':id')
    async getAccountById(
        @Param() id: string
    ): Promise<AccountResponseDto> {
        return this.queryBus.execute(new GetAccountByIdQuery(id));
    }

    // POST /accounts
    @Post()
    async createAccount(
        @Body() body: CreateAccountRequestDto
    ): Promise<AccountResponseDto> {
        return this.commandBus.execute(new CreateAccountCommand(body));
    }

    // PATCH /accounts/:id
    // TODO: Implementar updateAccount

    // POST /accounts/:id/inactivate
    @Post(':id/inactivate')
    async inactivateAccount(
        @Param() id: string
    ): Promise<void> {
        return this.commandBus.execute(new InactivateAccountCommand(id));
    }

    // POST /accounts/:id/activate
    @Post(':id/activate')
    async activateAccount(
        @Param() id: string
    ): Promise<void> {
        return this.commandBus.execute(new ActivateAccountCommand(id));
    }

}