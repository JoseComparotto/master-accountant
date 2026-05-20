import { CommandHandler } from "@nestjs/cqrs";
import { CreateChartOfAccountCommand } from "../commands/create-chart-of-account.command";
import { ChartOfAccounts } from "../../domain/entities/chart-of-accounts.entity";
import { EntityManager } from "@mikro-orm/core";

@CommandHandler(CreateChartOfAccountCommand)
export class CreateChartOfAccountHandler {

    constructor(private readonly em: EntityManager) { }

    async execute(command: CreateChartOfAccountCommand): Promise<string> {

        const chart = ChartOfAccounts.create(command.id, command.name, command.levelWidths);

        this.em.persist(chart); // Síncrono (Avisa a memória)
        await this.em.flush();      // Assíncrono (Executa o SQL atômico)
        return chart.id;
    }
}