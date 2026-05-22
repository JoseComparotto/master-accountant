import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { EntityManager } from '@mikro-orm/postgresql';
import { GetAllAccountsForChartQuery } from '@modules/chart-of-accounts/application/queries/get-account-tree.query';
import { AccountNode } from '@modules/chart-of-accounts/domain/entities/account-node.entity';
import { AccountDto } from '@/modules/chart-of-accounts/infrastructure/http/dtos/account.dto';
import { AccountSnapshot } from '@/modules/chart-of-accounts/domain/entities/account-snapshot.entity';

@QueryHandler(GetAllAccountsForChartQuery)
export class GetAllAccountsForChartHandler implements IQueryHandler<GetAllAccountsForChartQuery> {
  constructor(private readonly em: EntityManager) { }

  async execute({ chartId, targetDate }: GetAllAccountsForChartQuery): Promise<AccountDto[]> {
    const nodes = await this.em.find(AccountNode, { chartOfAccounts: chartId }, {
      populate: ['currentSnapshot', 'history'],
      orderBy: { pathLtree: 'ASC' }
    });

    return nodes.reduce((acc, node) => {
      const snapshot = node.findSnapshotAt(targetDate);
      
      if (snapshot) {
        acc.push(this.mapToDto(node, snapshot));
      }
      return acc;
    }, [] as AccountDto[]);
  }

  private mapToDto(node: AccountNode, snapshot: AccountSnapshot): AccountDto {
    return {
      id: node.id,
      code: node.nodeCode,
      path: node.formattedCode,
      isAbstract: node.isAbstract,
      name: snapshot.name,
      balanceType: snapshot.balanceType,
      accountClass: snapshot.accountClass,
    };
  }
}