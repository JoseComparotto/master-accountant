import { DomainException } from "../../../shared/domain/exception/domain.exception";
import { AccountEntity, CreateAccountProps } from "../entities/account.entity";
import type { IAccountRepository } from "../interfaces/account-repository.interface";

export class AccountDomainService {
  constructor(private readonly repository: IAccountRepository) { }

  async createAccount(data: CreateAccountProps) {

    // 1. Chama a Factory (Validações Locais)
    const account = AccountEntity.create(data);

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

  updateAccountMetadata(account: AccountEntity, name: string, description?: string){

    account.updateMetadata(name, description); // Não há validação necessária

  }

}