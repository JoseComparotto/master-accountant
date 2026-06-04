import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { GetAllAccountsQuery } from "../../../application/queries/get-all-accounts.query";
import { GetAccountByIdQuery } from "../../../application/queries/get-account-by-id.query";
import { CreateAccountCommand } from "../../../application/commands/create-account.command";
import { InactivateAccountCommand } from "../../../application/commands/inactivate-account.command";

import { AccountResponseDto } from "../dtos/account-response.dto";
import { CreateAccountRequestDto } from "../dtos/create-account-request.dto";
import { ActivateAccountCommand } from "../../../application/commands/activate-account.command";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SwaggerTag } from "../../../../../shared/constants/swagger.constants";
import { PatchAccountRequestDto } from "../dtos/patch-account-request.dto";
import { PatchAccountCommand } from "../../../application/commands/patch-account.command";

@Controller('accounts')
@ApiTags(SwaggerTag.CHART_OF_ACCOUNTS)
export class AccountsController {

    constructor(
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
    ) { }

    // GET /accounts
    @Get()
    @ApiOperation({ operationId: 'getAllAccounts' })
    @ApiResponse({
        status: 200,
        description: 'Lista de contas',
        type: [AccountResponseDto]
    })
    async getAllAccounts(): Promise<AccountResponseDto[]> {
        return this.queryBus.execute(new GetAllAccountsQuery());
    }

    // GET /accounts/:id
    @Get(':id')
    @ApiOperation({ operationId: 'getAccountById' })
    @ApiResponse({
        status: 200,
        description: 'Dados da conta',
        type: AccountResponseDto
    })
    async getAccountById(
        @Param('id') id: string
    ): Promise<AccountResponseDto> {
        return this.queryBus.execute(new GetAccountByIdQuery(id));
    }

    // POST /accounts
    @Post()
    @ApiOperation({ operationId: 'createAccount' })
    @ApiResponse({
        status: 201,
        description: 'Conta criada com sucesso',
        type: AccountResponseDto
    })
    async createAccount(
        @Body() body: CreateAccountRequestDto
    ): Promise<AccountResponseDto> {
        return this.commandBus.execute(new CreateAccountCommand(body));
    }

    // PATCH /accounts/:id
    @Patch(':id')
    @ApiOperation({ operationId: 'patchAccount' })
    @ApiResponse({
        status: 200,
        description: 'Conta atualizada com sucesso.'
    })
    async patchAccount(
        @Param('id') id: string,
        @Body() body: PatchAccountRequestDto
    ): Promise<AccountResponseDto> {
        return this.commandBus.execute(new PatchAccountCommand(id, body));
    }

    // PATCH /accounts/:id/inactivate
    @Patch(':id/inactivate')
    @ApiOperation({ operationId: 'inactivateAccount' })
    @ApiResponse({
        status: 200,
        description: 'Conta inativada com sucesso.',
        type: AccountResponseDto,
        example: {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "name": "Ativo Circulante",
            "description": "Bens e direitos com expctativa de liquidação dentro do exercício corrente.",
            "parentId": "123e4567-e89b-12d3-a456-426614174000",
            "localIndex": 1,
            "formattedCode": "1.1",
            "accountClass": "asset",
            "balanceType": "debit",
            "isSummary": true,
            "isContra": false,
            "isActive": false
        } as AccountResponseDto
    })
    async inactivateAccount(
        @Param('id') id: string
    ): Promise<AccountResponseDto> {
        return await this.commandBus.execute(new InactivateAccountCommand(id));
    }

    // PATCH /accounts/:id/activate
    @Patch(':id/activate')
    @ApiOperation({ operationId: 'activateAccount' })
    @ApiResponse({
        status: 200,
        description: 'Conta ativada com sucesso.',
        type: AccountResponseDto
    })
    async activateAccount(
        @Param('id') id: string
    ): Promise<AccountResponseDto> {
        return await this.commandBus.execute(new ActivateAccountCommand(id));
    }

}