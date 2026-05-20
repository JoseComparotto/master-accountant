export class PublishChangesetCommand {
  constructor(
    public readonly changesetId: string,
    public readonly effectiveDate?: Date,
  ) {}
}