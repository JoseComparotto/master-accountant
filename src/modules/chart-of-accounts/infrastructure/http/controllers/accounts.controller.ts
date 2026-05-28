import { BadRequestException, Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SWAGGER_TAGS } from '@shared/constants/swagger.constants';
import { GetAllAccountsForChartQuery } from '@modules/chart-of-accounts/application/queries/get-account-tree.query';
import { GetAccountsForChartQueryDto } from '@modules/chart-of-accounts/infrastructure/http/dtos/get-accounts-for-chart-query.dto';
import { AccountReturnDto } from '@modules/chart-of-accounts/infrastructure/http/dtos/account-return.dto';
import { ChartIdParamDto } from '@modules/chart-of-accounts/infrastructure/http/dtos/chart-id-param.dto';
import { CreateAccountQueryDto } from '@modules/chart-of-accounts/infrastructure/http/dtos/create-account-query.dto';
import { CreateAccountBodyDto } from '@modules/chart-of-accounts/infrastructure/http/dtos/create-account-body.dto';
import { CreatedIdReturnDto } from '@shared/infrastructure/dto/CreatedIdReturn.dto';
import { CreateAccountDraftCommand } from '@modules/chart-of-accounts/application/commands/create-account-draft.command';
import { CreateAndPublishAccountCommand } from '@modules/chart-of-accounts/application/commands/create-and-publish-account.command';
import { CreateAccountCommand } from '@modules/chart-of-accounts/application/commands/create-account.command';
import { CreateAccountInput } from '@modules/chart-of-accounts/application/dto/create-account.input';

@ApiTags(SWAGGER_TAGS.CHART_OF_ACCOUNTS.name)
@Controller('charts-of-accounts/:chartId/accounts')
export class AccountsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  // GET /charts-of-accounts/:chartId/accounts[?date=yyyy-MM-dd]
  @ApiOperation({
    operationId: 'findAllAccountsForChart',
    summary: 'Obtém todas as contas para um Plano de Contas específico',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de contas',
    type: [AccountReturnDto],
  })
  @Get()
  async findAllForChart(
    @Param() {chartId}: ChartIdParamDto,
    @Query() query: GetAccountsForChartQueryDto
  ): Promise<AccountReturnDto[]> {

    const targetDate = query.date ? new Date(query.date) : undefined;

    // A Query retorna as contas com as máscaras resolvidas
    return this.queryBus.execute(
      new GetAllAccountsForChartQuery(chartId, targetDate),
    );
  }

  // POST /charts-of-accounts/:chartId/accounts{?autoPublish=false&|?}changesetId=<uuid>[&effectiveDate=yyyy-MM-dd] (DEFAULT)
  // POST /charts-of-accounts/:chartId/accounts?autoPublish=true[&effectiveDate=yyyy-MM-dd][&changesetId=<uuid>] (ALTERNATIVE)
@ApiOperation({
    operationId: 'createAccount',
    summary: 'Cria uma nova conta dentro do Plano de Contas especificado',
  })
  @ApiResponse({ status: 201, type: CreatedIdReturnDto })
  @Post()
  async create(
    @Param() { chartId }: ChartIdParamDto,
    @Query() { autoPublish, changesetId, effectiveDate }: CreateAccountQueryDto,
    @Body() payload: CreateAccountBodyDto
  ): Promise<CreatedIdReturnDto> {
    
    // Mapeamento: Transforma dados de Infra/Web em dados de Aplicação
    const input: CreateAccountInput = {
      ...payload, // name, isContra, isAbstract, etc.
      
      chartId,
      changesetId: changesetId ?? null,
      autoPublish: !!autoPublish,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : undefined,
    };

    // O Controller não sabe "como" criar, ele apenas envia a intenção
    return this.commandBus.execute(new CreateAccountCommand(input));
  }

}