import { Controller, Get, Post, Put, Patch, Param, Body, Res, HttpStatus } from "@nestjs/common";
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { Response } from 'express';

import { GetAllAccountsQuery } from "../../../application/queries/get-all-accounts/get-all-accounts.query";
import { GetAccountsTreeQuery } from "../../../application/queries/get-accounts-tree/get-accounts-tree.query";
import { GetAccountByIdQuery } from "../../../application/queries/get-account-by-id/get-account-by-id.query";

import { ActivateAccountCommand } from "../../../application/commands/activate-account/activate-account.command";
import { CreateAccountCommand } from "../../../application/commands/create-account/create-account.command";
import { InactivateAccountCommand } from "../../../application/commands/inactivate-account/inactivate-account.command";
import { PatchAccountCommand } from "../../../application/commands/patch-account/patch-account.command";
import { UpsertAccountCommand, UpsertAccountResult } from "../../../application/commands/upsert-account/upsert-account.command";
import { ReplaceAccountsCommand, ReplaceAccountsResult } from "../../../application/commands/replace-accounts/replace-accounts.command";

// Importações dos novos DTOs puros baseados em class-validator
import { 
    AccountDto, 
    AccountNodeDto, 
    CreateAccountInputDto, 
    UpsertAccountInputDto, 
    ReplaceAccountInputDto, 
    PatchAccountInputDto 
} from "../dtos/accounts.dto";
import { ApiBody } from "@nestjs/swagger";

@Controller('accounts')
export class AccountsController {
    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
    ) { }

    @Get()
    async getAll(): Promise<AccountDto[]> {
        const query = new GetAllAccountsQuery();
        return await this.queryBus.execute(query);
    }

    @Get('tree')
    async getTree(): Promise<AccountNodeDto[]> {
        const query = new GetAccountsTreeQuery();
        return await this.queryBus.execute(query);
    }

    @Get(':id')
    async getById(@Param('id') id: string): Promise<AccountDto> {
        const query = new GetAccountByIdQuery(id);
        return await this.queryBus.execute(query);
    }

    @Post()
    async create(@Body() body: CreateAccountInputDto): Promise<AccountDto> {
        const command = new CreateAccountCommand(body);
        return await this.commandBus.execute(command);
    }

    @Put(':id')
    async upsert(
        @Param('id') id: string, 
        @Body() body: UpsertAccountInputDto,
        @Res({ passthrough: true }) res: Response
    ): Promise<AccountDto> {
        const command = new UpsertAccountCommand(id, body);
        const result: UpsertAccountResult = await this.commandBus.execute(command);

        // Controla nativamente o status HTTP dependendo da ação do CQRS
        if (result.action === 'created') {
            res.status(HttpStatus.CREATED);
        } else {
            res.status(HttpStatus.OK);
        }

        return result.account;
    }

    @Put()
    @ApiBody({ type: [ReplaceAccountInputDto] })
    async replaceAll(@Body() body: ReplaceAccountInputDto[]): Promise<AccountDto[]> {
        const command = new ReplaceAccountsCommand(body);
        const result: ReplaceAccountsResult = await this.commandBus.execute(command);
        return result.accounts;
    }

    @Patch(':id')
    async patch(@Param('id') id: string, @Body() body: PatchAccountInputDto): Promise<AccountDto> {
        const command = new PatchAccountCommand(id, body);
        return await this.commandBus.execute(command);
    }

    @Post(':id/activate')
    async activate(@Param('id') id: string): Promise<AccountDto> {
        const command = new ActivateAccountCommand(id);
        return await this.commandBus.execute(command);
    }

    @Post(':id/inactivate')
    async inactivate(@Param('id') id: string): Promise<AccountDto> {
        const command = new InactivateAccountCommand(id);
        return await this.commandBus.execute(command);
    }
}