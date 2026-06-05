import { AccountEntity, CreateAccountProps, AccountMetadataPatch } from '../entities/account.entity.js';
import { AccountInvariantViolationException } from '../exceptions/account.exception.js';
import type { AccountRepository } from '../interfaces/account-repository.interface.js';
import { IHierarchyCheckerService } from '../interfaces/hierarchy-checker.interface.js';

export class AccountDomainService {
  constructor(
    private readonly hierarchyChercker: IHierarchyCheckerService,
    private readonly repository: AccountRepository
  ) { }

  async createAccount(data: Omit<CreateAccountProps, 'localIndex'> & { localIndex?: number | null }) {

    const { parent, accountClass, localIndex: _localIndex, ...commonProps } = data;

    if (!parent && !accountClass) {
      throw new AccountInvariantViolationException("COA-01","Root accounts must have an account class defined.");
    }

    const localIndex = _localIndex ?? await this.generateNextLocalIndex(parent);

    // 1. Chama a Factory (Validações Locais)
    const account = parent
      ? await AccountEntity.createChild({
        ...commonProps,
        parent,
        accountClass,
        localIndex
      }, this.hierarchyChercker)
      : await AccountEntity.createRoot({
        ...commonProps,
        accountClass: accountClass!, // O non-null assertion é seguro aqui devido à validação acima
        localIndex
      }, this.hierarchyChercker);

    return account;
  }

  private async generateNextLocalIndex(parent: AccountEntity | null): Promise<number> {
    const lastIndex = await this.repository.findLastLocalIndex(parent?.id ?? null);
    return lastIndex + 1;
  }

  patchAccountMetadata(account: AccountEntity, patch: AccountMetadataPatch) {
    account.patchMetadata(patch);
  }

  activateAccount(account: AccountEntity) {
    account.activate();
  }

  async inactivateAccount(account: AccountEntity) {
    await account.inactivate(this.hierarchyChercker);
  }

  async applyContraLogic(account: AccountEntity, isContra: boolean) {
    await account.applyContraLogic(isContra, this.hierarchyChercker);
  }

}