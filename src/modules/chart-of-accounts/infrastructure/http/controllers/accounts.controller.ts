import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

// Importe a Query da camada de Application
import { GetAccountTreeQuery } from '../../../application/queries/get-account-tree.query';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('tree')
  async getTree(
    @Query('chartId') chartId: string,
    @Query('date') date?: string, // Para a viagem no tempo (Bitemporalidade)
  ) {
    // Se o contador não passar data, assume "agora"
    const targetDate = date ? new Date(date) : new Date();

    // A Query retorna a árvore já montada com as máscaras resolvidas
    return this.queryBus.execute(
      new GetAccountTreeQuery(chartId, targetDate),
    );
  }
}