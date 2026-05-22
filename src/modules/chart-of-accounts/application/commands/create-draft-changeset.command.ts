import { VersionIncrementType } from "@modules/chart-of-accounts/domain/enumns/version-increment-type.enum";
import { ICommand } from "@nestjs/cqrs";

export class CreateDraftChangesetCommand implements ICommand  {
  constructor(
    public readonly id: string | undefined,
    public readonly chartOfAccountsId: string,
    public readonly incrementType: VersionIncrementType,
    public readonly effectiveDate?: Date,
  ) {}
}