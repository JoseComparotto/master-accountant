import { DomainException } from '../../../shared/exception/domain.exception.js';
import { AccountEntity, CreateAccountProps, CreateRootAccountProps } from '../entities/account.entity.js';
import type { IAccountRepository } from '../interfaces/account-repository.interface.js';

export class AccountDomainService {
  constructor(private readonly repository: IAccountRepository) { }

  async createAccount(data: CreateAccountProps) {

    const { parent, accountClass, localIndex : _localIndex, ...commonProps } = data;

    if (!parent && !accountClass) {
      throw new DomainException("COA-01: Root accounts must have an account class defined.");
    }

    const localIndex = _localIndex ?? await this.generateNextLocalIndex(parent);

    // 1. Chama a Factory (Validações Locais)
    const account = parent
      ? AccountEntity.createChild({
        ...commonProps,
        parent,
        accountClass,
        localIndex
      })
      : AccountEntity.createRoot({
        ...commonProps,
        accountClass: accountClass!, // O non-null assertion é seguro aqui devido à validação acima
        localIndex
      });

    // 2. Validações de Árvore (Async/DB)

    // HTI-01: Validação de Raiz Única
    if (!account.parent) {
      const existingRoot = await this.repository.findRootByClass(account.accountClass);
      if (existingRoot) throw new DomainException("HTI-01: Root account already exists for this class.");
    }

    // HTI-08: Unicidade do Local Index entre irmãos
    const isIndexTaken = await this.repository.isIndexUsedBySiblings(
      account.parent?.id,
      account.localIndex
    );
    if (isIndexTaken) throw new DomainException("HTI-08: Local Index must be unique among siblings.");

    return account;
  }

  private async generateNextLocalIndex(parent?: AccountEntity): Promise<number> {
    const lastIndex = await this.repository.findLastLocalIndex(parent?.id);
    return lastIndex + 1;
  }

  activateAccount(account: AccountEntity) {

    account.activate(); // Validação é feita na entidade

  }

  async inactivateAccount(account: AccountEntity) {

    if (account.isSummary) {

      const children: AccountEntity[] = await this.repository.findByParent(account);
      const hasActiveChildren = children.some(c => c.isActive);

      if (hasActiveChildren) {
        throw new DomainException("HTI-07: Cannot inactivate an account with active children.");
      }
    }

    account.inactivate();

  }

  updateAccountMetadata(account: AccountEntity, name: string, description?: string) {

    account.updateMetadata(name, description); // Não há validação necessária

  }

}