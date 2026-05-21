// src/application/handlers/get-account-tree.handler.ts
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { EntityManager } from '@mikro-orm/core';
import { GetAccountTreeQuery } from '@modules/chart-of-accounts/application/queries/get-account-tree.query';
import { AccountNode } from '@modules/chart-of-accounts/domain/entities/account-node.entity';

@QueryHandler(GetAccountTreeQuery)
export class GetAccountTreeHandler implements IQueryHandler<GetAccountTreeQuery> {
  constructor(private readonly em: EntityManager) {}

  async execute(query: GetAccountTreeQuery): Promise<any[]> {
    // Busca todos os nós do plano de contas...
    const nodes = await this.em.find(
      AccountNode,
      { chartOfAccounts: query.chartId },
      { 
        // 1. Traz o conteúdo semântico atual junto
        populate: ['currentSnapshot'], 
        
        // 2. A MÁGICA DO LTREE: O banco resolve a hierarquia para você!
        // Um simples "ORDER BY path_ltree ASC" entrega a árvore perfeitamente identada.
        orderBy: { pathLtree: 'ASC' } 
      }
    );

    // 3. Mapeia para um formato limpo (DTO de saída) para o frontend ler
    return nodes.map(node => {
      const snapshot = node.currentSnapshot;
      
      return {
        id: node.id,
        code: node.nodeCode,
        path: node.pathLtree,
        isAbstract: node.isAbstract, // Do AccountNode
        
        // Dados do Snapshot (Semântica)
        name: snapshot?.name,
        balanceType: snapshot?.balanceType,
        group: snapshot?.groupType,
      };
    });
  }
}