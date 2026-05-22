import { CommandHandler } from "@nestjs/cqrs";
import { CreateChartOfAccountsCommand } from "@/modules/chart-of-accounts/application/commands/create-chart-of-accounts.command";
import { ChartOfAccounts } from "@modules/chart-of-accounts/domain/entities/chart-of-accounts.entity";
import { EntityManager } from "@mikro-orm/postgresql";
import { CreatedUuidDto } from "@/shared/infrastructure/dto/CreatedUuid.dto";

@CommandHandler(CreateChartOfAccountsCommand)
export class CreateChartOfAccountHandler {

    constructor(private readonly em: EntityManager) { }

    async execute(command: CreateChartOfAccountsCommand): Promise<CreatedUuidDto> {

        const chart = ChartOfAccounts.create(command.id, command.name, command.levelWidths);

        this.em.persist(chart); // Síncrono (Avisa a memória)
        await this.em.flush();      // Assíncrono (Executa o SQL atômico)
        return { id: chart.id };
    }
}