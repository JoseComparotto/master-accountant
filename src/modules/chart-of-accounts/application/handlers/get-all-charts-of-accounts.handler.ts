import { ChartOfAccounts } from "@/modules/chart-of-accounts/domain/entities/chart-of-accounts.entity";
import { ChartOfAccountDto } from "@/modules/chart-of-accounts/infrastructure/http/dtos/chart-of-account.dto";
import { EntityManager } from "@mikro-orm/core";
import { GetAllChartsOfAccountsQuery } from "@modules/chart-of-accounts/application/queries/get-all-charts-of-accounts.query";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

@QueryHandler(GetAllChartsOfAccountsQuery)
export class GetAllChartsOfAccountsHandler implements IQueryHandler<GetAllChartsOfAccountsQuery> {
  constructor(private readonly em: EntityManager) {}

  async execute(_query: GetAllChartsOfAccountsQuery): Promise<ChartOfAccountDto[]> {
    
    const chats = await this.em.findAll(ChartOfAccounts, {
      orderBy: { createdAt: 'DESC' }
    });

    return chats.map(this.mapToDto);

  }

  private mapToDto(chart: ChartOfAccounts): ChartOfAccountDto {
    return {
      id: chart.id,
      name: chart.name,
      levelWidths: chart.levelWidths,
      createdAt: chart.createdAt,
    };
  }
}