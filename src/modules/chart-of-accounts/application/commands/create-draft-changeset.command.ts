import { VersionIncrementType } from "../../domain/enumns/version-increment-type.enum";

export class CreateDraftChangesetCommand {
  constructor(
    public readonly chartOfAccountsId: string,
    public readonly incrementType: VersionIncrementType,
    public readonly effectiveDate?: Date,
  ) {}
}