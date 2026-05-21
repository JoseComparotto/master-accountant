import { VersionIncrementType } from "@modules/chart-of-accounts/domain/enumns/version-increment-type.enum";

export class CreateDraftChangesetCommand {
  constructor(
    public readonly id: string | undefined,
    public readonly chartOfAccountsId: string,
    public readonly incrementType: VersionIncrementType,
    public readonly effectiveDate?: Date,
  ) {}
}