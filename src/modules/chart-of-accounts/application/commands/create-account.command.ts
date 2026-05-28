import { CreateAccountInput } from "@modules/chart-of-accounts/application/dto/create-account.input";
import { ICommand } from "@nestjs/cqrs";

export class CreateAccountCommand implements ICommand {
  constructor(public readonly data: CreateAccountInput) {}
}