import { ChartOfAccounts } from "@/modules/chart-of-accounts/domain/entities/chart-of-accounts.entity";
import { ChartOfAccountReturnDto } from "@modules/chart-of-accounts/infrastructure/http/dtos/chart-of-account-return.dto";
import { EntityManager } from "@mikro-orm/postgresql";
import { GetAllChartsOfAccountsQuery } from "@modules/chart-of-accounts/application/queries/get-all-charts-of-accounts.query";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

@QueryHandler(GetAllChartsOfAccountsQuery)
export class GetAllChartsOfAccountsHandler implements IQueryHandler<GetAllChartsOfAccountsQuery> {
  constructor(private readonly em: EntityManager) {}

  async execute(_query: GetAllChartsOfAccountsQuery): Promise<ChartOfAccountReturnDto[]> {
    
    const chats = await this.em.findAll(ChartOfAccounts, {
      orderBy: { createdAt: 'DESC' }
    });

    return chats.map(this.mapToDto);

  }

  private mapToDto(chart: ChartOfAccounts): ChartOfAccountReturnDto {
    return {
      id: chart.id,
      name: chart.name,
      levelWidths: chart.levelWidths,
      createdAt: chart.createdAt,
    };
  }
}