import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { CreateAccountInput } from '@modules/chart-of-accounts/application/dto/create-account.input';
import { AccountNode } from '@modules/chart-of-accounts/domain/entities/account-node.entity';
import { AccountSnapshot } from '@modules/chart-of-accounts/domain/entities/account-snapshot.entity';
import { AccountDomainService } from '@modules/chart-of-accounts/domain/services/account-validator.service';

@Injectable()
export class AccountAppService {
  constructor(
    private readonly em: EntityManager,
    private readonly accountValidator: AccountDomainService,
  ) {}

  /**
   * Orquestra a criação de uma conta, decidindo entre rascunho ou publicação imediata.
   */
  async createAccount(input: CreateAccountInput): Promise<string> {
    // Iniciamos uma transação para garantir que Node e Snapshot sejam criados atomicamente
    return await this.em.transactional(async (forkEm) => {
      
      // 1. Busca referências necessárias (Pai, Changeset, etc)
      const parentNode = input.parentId 
        ? await forkEm.findOneOrFail(AccountNode, input.parentId) 
        : null;

      // 2. Instancia o Nó (Identidade)
      const node = new AccountNode({
        id: input.id,
        chart: forkEm.getReference('ChartOfAccounts', input.chartId),
        parent: parentNode,
        accountClass: input.accountClass,
        isContra: input.isContra,
        isAbstract: input.isAbstract,
        nodeCode: input.nodeCode,
      });

      // 3. Validação de Domínio (O "Estatuto")
      // Passamos a responsabilidade de "pode ou não pode" para o Domain Service
      this.accountValidator.validateNewNode(node, parentNode);

      // 4. Cria o Snapshot inicial (Estado)
      const snapshot = new AccountSnapshot({
        node,
        name: input.name,
        description: input.description,
        changeset: forkEm.getReference('Changeset', input.changesetId),
      });

      // 5. Persistência
      forkEm.persist([node, snapshot]);

      // 6. Flow-Fork: Publicação Automática
      if (input.autoPublish) {
        await this.publishImmediately(node, input.effectiveDate, forkEm);
      }

      return node.id;
    });
  }

  private async publishImmediately(node: AccountNode, effectiveDate: Date, em: EntityManager) {
    // Aqui chamaria a lógica de publicação (que valida se o changeset pode ser fechado, etc)
    // Por enquanto, apenas um placeholder da intenção
    console.log(`Publicando nó ${node.id} com data ${effectiveDate}`);
  }
}