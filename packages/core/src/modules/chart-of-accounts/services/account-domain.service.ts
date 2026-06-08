import { AttributeImmutableViolationException } from '../../../shared/exception/domain.exception.js';
import { UuidValue } from '../../../shared/value-objects/uuid.value.js';
import { AccountEntity, CreateAccountProps, AccountMetadataPatch, UpdateAccountProps } from '../entities/account.entity.js';
import { AccountInvariantViolationException } from '../exceptions/account.exception.js';
import type { IAccountRepository } from '../interfaces/account-repository.interface.js';
import { IHierarchyCheckerService } from '../interfaces/hierarchy-checker.interface.js';
import { AccountNameValue } from '../value-objects/account-name.value.js';

const MUTABLE_FIELDS = new Set<keyof UpdateAccountProps>([
  'name',
  'description',
  'isContra',
  'isActive',
]);

export class AccountDomainService {
  constructor(
    private readonly hierarchyChercker: IHierarchyCheckerService,
    private readonly repository: IAccountRepository
  ) { }

  async createAccount(data: Omit<CreateAccountProps, 'localIndex'> & { localIndex?: number | null }) {

    const { parent, accountClass, localIndex: _localIndex, ...commonProps } = data;

    if (!parent && !accountClass) {
      throw new AccountInvariantViolationException("COA-01", "Root accounts must have an account class defined.");
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

  async updateAccount(account: AccountEntity, target: UpdateAccountProps): Promise<void> {
    type FieldName = keyof UpdateAccountProps;

    const diffMap: Record<FieldName, boolean> = {
      parentId: !UuidValue.isEquals(target.parentId, account.parentId),
      name: !AccountNameValue.isEquals(target.name, account.name),
      description: target.description !== account.description,
      localIndex: target.localIndex !== account.localIndex,
      accountClass: target.accountClass !== account.accountClass,
      isSummary: target.isSummary !== account.isSummary,
      isContra: target.isContra !== account.isContra,
      isActive: target.isActive !== account.isActive,
    };

    const violation = Object.keys(diffMap)
      .find(k => diffMap[k as FieldName] && !MUTABLE_FIELDS.has(k as FieldName));
    if (violation) {
      throw new AttributeImmutableViolationException(violation);
    }

    if (diffMap.name || diffMap.description) {
      this.patchAccountMetadata(account, {
        name: target.name,
        description: target.description,
      });
    }

    if (diffMap.isContra) {
      await this.applyContraLogic(account, target.isContra);
    }

    if (diffMap.isActive) {
      if (target.isActive) {
        this.activateAccount(account);
      } else {
        await this.inactivateAccount(account);
      }
    }
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