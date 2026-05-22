import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SWAGGER_TAGS } from '@shared/constants/swagger.constants';
import { GetAllAccountsForChartQuery } from '@modules/chart-of-accounts/application/queries/get-account-tree.query';
import { GetAccountsForChartQueryDto } from '@/modules/chart-of-accounts/infrastructure/http/dtos/get-accounts-for-chart-query.dto';
import { AccountDto } from '@/modules/chart-of-accounts/infrastructure/http/dtos/account.dto';
import { GetAccountsForChartParamDto } from '@/modules/chart-of-accounts/infrastructure/http/dtos/get-accounts-for-chart-param.dto';

@ApiTags(SWAGGER_TAGS.CHART_OF_ACCOUNTS.name)
@Controller('charts-of-accounts/:chartId/accounts')
export class AccountsController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    operationId: 'findAllAccountsForChart',
    summary: 'Obtém todas as contas para um Plano de Contas específico',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de contas',
    type: [AccountDto],
  })
  @Get()
  async findAllForChart(
    @Param() {chartId}: GetAccountsForChartParamDto,
    @Query() query: GetAccountsForChartQueryDto
  ): Promise<AccountDto[]> {

    const targetDate = query.date ? new Date(query.date) : undefined;

    // A Query retorna as contas com as máscaras resolvidas
    return this.queryBus.execute(
      new GetAllAccountsForChartQuery(chartId, targetDate),
    );
  }
}