import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { CreateChartOfAccountDto } from '@modules/chart-of-accounts/infrastructure/http/dtos/create-chart-of-account.dto';
import { CreateChartOfAccountCommand } from '@modules/chart-of-accounts/application/commands/create-chart-of-account.command';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SWAGGER_TAGS } from '@shared/constants/swagger.constants';

@ApiTags(SWAGGER_TAGS.CHART_OF_ACCOUNTS.name)
@Controller('charts-of-accounts')
export class ChartsOfAccountsController {
    constructor(private readonly commandBus: CommandBus) { }

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

}