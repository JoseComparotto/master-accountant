import { Injectable } from '@nestjs/common';
import { AccountNode } from '../entities/account-node.entity';
import { DomainError } from '@shared/exceptions/domain.error';

@Injectable()
export class AccountDomainService {
  /**
   * Valida as invariantes de um novo nó em relação ao seu ascendente.
   * Aplica as regras HTR-02 e NAT-03 do Estatuto.
   */
  validateNewNode(node: AccountNode, parent: AccountNode | null): void {
    if (!parent) {
      // Se for conta raiz, não há regras de parentesco a validar.
      return;
    }

    this.validateHierarchyConstraints(node, parent);
    this.validateAccountingLogicConstraints(node, parent);
  }

  /**
   * HTR-02: Exclusividade de Paternidade Sintética
   */
  private validateHierarchyConstraints(node: AccountNode, parent: AccountNode): void {
    if (!parent.isAbstract) {
      throw new DomainError(
        `HTR-02: A conta ascendente "${parent.id}" é analítica. Somente contas sintéticas podem possuir descendentes.`,
      );
    }
  }

  /**
   * NAT-03: Herança Compulsória de Redução
   */
  private validateAccountingLogicConstraints(node: AccountNode, parent: AccountNode): void {
    // Regra de Herança de Redução
    if (parent.isContra && !node.isContra) {
      throw new DomainError(
        `NAT-03: A conta ascendente "${parent.id}" é redutora. Por herança de linhagem, a nova conta também deve ser obrigatoriamente redutora.`,
      );
    }

    // Regra implícita de consistência de classe
    if (node.accountClass && node.accountClass !== parent.accountClass) {
      throw new DomainError(
        `NAT-04: Conflito de Classe. A conta descendente deve pertencer à mesma classe do pai (${parent.accountClass}).`,
      );
    }
  }
}