import { ICommand } from "@nestjs/cqrs";

export class DiscardChangesetCommand implements ICommand {
  constructor(
    public readonly changesetId: string,
  ) {}
}