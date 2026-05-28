import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { EntityManager } from '@mikro-orm/postgresql';
import { GetAllAccountsForChartQuery } from '@modules/chart-of-accounts/application/queries/get-account-tree.query';
import { AccountNode } from '@modules/chart-of-accounts/domain/entities/account-node.entity';
import { AccountReturnDto } from '@modules/chart-of-accounts/infrastructure/http/dtos/account-return.dto';
import { AccountSnapshot } from '@/modules/chart-of-accounts/domain/entities/account-snapshot.entity';

@QueryHandler(GetAllAccountsForChartQuery)
export class GetAllAccountsForChartHandler implements IQueryHandler<GetAllAccountsForChartQuery> {
  constructor(private readonly em: EntityManager) { }

  async execute({ chartId, targetDate }: GetAllAccountsForChartQuery): Promise<AccountReturnDto[]> {
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
    }, [] as AccountReturnDto[]);
  }

  private mapToDto(node: AccountNode, snapshot: AccountSnapshot): AccountReturnDto {
    return {
      id: node.id,
      code: node.nodeCode,
      path: node.formattedCode,
      isAbstract: node.isAbstract,
      name: snapshot.name,
      balanceType: node.balanceType,
      accountClass: node.accountClass,
    };
  }
}