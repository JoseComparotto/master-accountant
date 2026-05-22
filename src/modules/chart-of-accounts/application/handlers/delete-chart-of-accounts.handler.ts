import { DeleteChartOfAccountsCommand } from "@/modules/chart-of-accounts/application/commands/delete-chart-of-accounts.command";
import { ChartOfAccounts } from "@/modules/chart-of-accounts/domain/entities/chart-of-accounts.entity";
import { EntityManager } from "@mikro-orm/postgresql";
import { CommandHandler } from "@nestjs/cqrs";

@CommandHandler(DeleteChartOfAccountsCommand)
export class DeleteChartOfAccountsHandler {
    constructor(private readonly em: EntityManager) {}
    
    async execute(command: DeleteChartOfAccountsCommand): Promise<void> {
        const { id } = command;

        const chart = await this.em.findOneOrFail(ChartOfAccounts, id);

        this.em.remove(chart);
        await this.em.flush();
    }
}