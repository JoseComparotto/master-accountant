import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { CreateChartOfAccountDto } from '../dtos/create-chart-of-account.dto';
import { CreateChartOfAccountCommand } from '../../../application/commands/create-chart-of-account.command';

@Controller('charts-of-accounts')
export class ChartsOfAccountsController {
    constructor(private readonly commandBus: CommandBus) { }

    @Post()
    async create(@Body() dto: CreateChartOfAccountDto) {
        return this.commandBus.execute(
            new CreateChartOfAccountCommand(dto.id, dto.name, dto.levelWidths)
        );
    }

}