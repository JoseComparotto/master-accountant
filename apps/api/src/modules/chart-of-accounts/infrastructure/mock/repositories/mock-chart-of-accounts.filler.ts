import { AccountClassEnum } from "@repo/core";
import { AccountStorageSnapshot, ChartStorageSnapshot } from "./mock-chart-of-accounts.repository";
import { AppConfig } from "../../../../../config/configuration";

export class MockChartOfAccountsFiller {

    public static readonly DEFAULT_CHART_ID = process.env.DEFAULT_CHART_ID!;

    /**
     * Helper privado para gerar o UUID determinístico baseado em um número de sequência
     */
    private static generateDeterministicId(sequence: number): string {
        return `00000000-0000-4000-8000-${sequence.toString().padStart(12, '0')}`;
    }

    public static fill(database: Map<string, ChartStorageSnapshot>, mockConfig: AppConfig['mock']): void {

        const { autoSeed, defaultChartId: chartId } = mockConfig;

        // Helper Factory estendido para gerenciar as sequências determinísticas de ID
        const createGroup = (
            seq: number,           // Sequência única desta conta (ex: 1, 2, 6...)
            code: number[],
            name: string,
            accountClass: `${AccountClassEnum}`,
            parentSeq: number | null = null // Sequência da conta pai (opcional)
        ): AccountStorageSnapshot => ({
            id: this.generateDeterministicId(seq),
            structuralCode: code,
            parentId: parentSeq ? this.generateDeterministicId(parentSeq) : null,
            name,
            description: `Grupo estrutural de ${name}`,
            accountClass,
            isSummary: true,
            isContra: false,
            isActive: true
        });

        const accounts: AccountStorageSnapshot[] = [
            // ========================================================
            // 1. AS 5 CLASSES RAÍZES (Nível 1) - Sequências de 1 a 5
            // ========================================================
            createGroup(1, [1], 'Ativo', 'asset'),
            createGroup(2, [2], 'Passivo', 'liability'),
            createGroup(3, [3], 'Patrimônio Líquido', 'equity'),
            createGroup(4, [4], 'Receitas', 'income'),
            createGroup(5, [5], 'Despesas', 'expense'),

            // ========================================================
            // 2. OS 4 GRUPOS OBRIGATÓRIOS (Nível 2) - Sequências de 6 a 9
            // ========================================================
            // Subgrupos do Ativo (Apontam para o parentSeq: 1)
            createGroup(6, [1, 1], 'Ativo Circulante', 'asset', 1),
            createGroup(7, [1, 2], 'Ativo Não Circulante', 'asset', 1),

            // Subgrupos do Passivo (Apontam para o parentSeq: 2)
            createGroup(8, [2, 1], 'Passivo Circulante', 'liability', 2),
            createGroup(9, [2, 2], 'Passivo Não Circulante', 'liability', 2),
        ];

        database.set(chartId, {
            chartId,
            version: 1, 
            accounts: autoSeed ? accounts : [],
        });
    }
}