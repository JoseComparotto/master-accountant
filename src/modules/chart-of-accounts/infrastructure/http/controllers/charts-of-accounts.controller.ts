import { SWAGGER_TAGS } from '@shared/constants/swagger.constants';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateChartOfAccountDto } from '@modules/chart-of-accounts/infrastructure/http/dtos/create-chart-of-account.dto';
import { CreateChartOfAccountCommand } from '@modules/chart-of-accounts/application/commands/create-chart-of-account.command';

import { GetAllChartsOfAccountsQuery } from '@modules/chart-of-accounts/application/queries/get-all-charts-of-accounts.query';
import { ChartOfAccountDto } from '@/modules/chart-of-accounts/infrastructure/http/dtos/chart-of-account.dto';

@ApiTags(SWAGGER_TAGS.CHART_OF_ACCOUNTS.name)
@Controller('charts-of-accounts')
export class ChartsOfAccountsController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) { }

    @ApiOperation({
        operationId: 'createChartOfAccount',
        summary: 'Cria um novo Plano de Contas',
    })
    @Post()
    async create(@Body() dto: CreateChartOfAccountDto) {
        return this.commandBus.execute(
            new CreateChartOfAccountCommand(dto.id, dto.name, dto.levelWidths)
        );
    }

    @ApiOperation({
        operationId: 'getAllChartsOfAccounts',
        summary: 'Retorna todos os Planos de Contas',
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de Planos de Contas',
        type: [ChartOfAccountDto],
    })
    @Get()
    async findAll(): Promise<ChartOfAccountDto[]> {
        return this.queryBus.execute(new GetAllChartsOfAccountsQuery());
    }

}