import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SWAGGER_TAGS } from '@shared/constants/swagger.constants';
import { GetAccountTreeQuery } from '@modules/chart-of-accounts/application/queries/get-account-tree.query';
import { GetAccountTreeDto } from '@modules/chart-of-accounts/infrastructure/http/dtos/get-account-tree.dto';

@ApiTags(SWAGGER_TAGS.CHART_OF_ACCOUNTS.name)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    operationId: 'getAccountTree',
    summary: 'Obtém a árvore de contas para um Plano de Contas específico',
  })
  @Get('tree')
  async getTree(@Query() query: GetAccountTreeDto) {
    // Se o contador não passar data, assume "agora"
    const targetDate = query.date ? new Date(query.date) : new Date();

    // A Query retorna a árvore já montada com as máscaras resolvidas
    return this.queryBus.execute(
      new GetAccountTreeQuery(query.chartId, targetDate),
    );
  }
}