import { SWAGGER_TAGS } from '@shared/constants/swagger.constants';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateChartOfAccountsBodyDto } from '@modules/chart-of-accounts/infrastructure/http/dtos/create-chart-of-accounts-body.dto';
import { CreateChartOfAccountsCommand } from '@/modules/chart-of-accounts/application/commands/create-chart-of-accounts.command';
import { DeleteChartOfAccountsCommand } from '@/modules/chart-of-accounts/application/commands/delete-chart-of-accounts.command';

import { GetAllChartsOfAccountsQuery } from '@modules/chart-of-accounts/application/queries/get-all-charts-of-accounts.query';
import { ChartOfAccountReturnDto } from '@modules/chart-of-accounts/infrastructure/http/dtos/chart-of-account-return.dto';
import { GenericIdDto } from '@shared/infrastructure/dto/GenericId.dto';
import { CreatedIdReturnDto } from '@shared/infrastructure/dto/CreatedIdReturn.dto';

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
    @ApiResponse({
        status: 201,
        description: 'Plano de Contas criado com sucesso',
        type: CreatedIdReturnDto,
    })
    @Post()
    async create(@Body() dto: CreateChartOfAccountsBodyDto): Promise<CreatedIdReturnDto> {
        return this.commandBus.execute(
            new CreateChartOfAccountsCommand(dto.id, dto.name, dto.levelWidths)
        );
    }

    @ApiOperation({
        operationId: 'getAllChartsOfAccounts',
        summary: 'Retorna todos os Planos de Contas',
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de Planos de Contas',
        type: [ChartOfAccountReturnDto],
    })
    @Get()
    async findAll(): Promise<ChartOfAccountReturnDto[]> {
        return this.queryBus.execute(new GetAllChartsOfAccountsQuery());
    }

    @ApiOperation({
        operationId: 'deleteChartOfAccount',
        summary: 'Exclui um Plano de Contas por ID',
    })
    @ApiResponse({
        status: 200,
        description: 'Plano de Contas excluído com sucesso',
    })
    @Delete(':id')
    async delete(@Param() { id }: GenericIdDto) {
        return this.commandBus.execute(new DeleteChartOfAccountsCommand(id));        
    }

}