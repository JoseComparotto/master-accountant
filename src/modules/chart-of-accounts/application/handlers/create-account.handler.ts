import { CreateAccountCommand } from '@modules/chart-of-accounts/application/commands/create-account.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(CreateAccountCommand)
export class CreateAccountHandler implements ICommandHandler<CreateAccountCommand> {
  constructor(private readonly accountAppService: AccountAppService) {}

  async execute(command: CreateAccountCommand) {
    const { data } = command;
    
    // O Handler apenas delega para o Application Service
    const createdId = await this.accountAppService.createAccount(data);
    
    return { id: createdId };
  }
}