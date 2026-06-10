import { UuidValue } from "../../../shared/value-objects/uuid.value.js";
import { IAccountRepository } from "../interfaces/account-repository.interface.js";

export class IndexGeneratorService {
  constructor(
    private readonly repo: IAccountRepository,
  ) { }

  async generateNextIndex(parentId: UuidValue | null) {
    const indexes: number[] = await this.repo.findUsedIndexesByParentId(parentId);

    return indexes.reduce((max, cur) => Math.max(max, cur), 0) + 1;
  }

}