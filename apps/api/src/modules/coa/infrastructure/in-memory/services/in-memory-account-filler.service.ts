import { AccountClassEnum, BalanceTypeEnum } from "@repo/coa-core";
import { AppConfig } from "../../../../../config/configuration";
import { AccountStorageSnapshot, ChartStorageSnapshot, InMemoryChartOfAccountsDatabase } from "../in-memory.database";
import { Injectable } from "@nestjs/common";

@Injectable()
export class InMemoryChartOfAccountsFillerService {

    public fill(database: InMemoryChartOfAccountsDatabase, mockConfig: AppConfig['mock']): void {

        const { autoSeed, defaultChartId: chartId } = mockConfig;

        database.chartsById.set(chartId, {
            chartId,
            version: 1,
        });

        if (!autoSeed) return;

        // Helper Factory estendido para gerenciar as sequências determinísticas de ID
        const createGroup = (
            seq: number,           // Sequência única desta conta (ex: 1, 2, 6...)
            code: number[],
            name: string,
            accountClass: `${AccountClassEnum}`,
            parentSeq: number | null = null // Sequência da conta pai (opcional)
        ): AccountStorageSnapshot => ({
            chartId,
            id: InMemoryChartOfAccountsFillerService.generateDeterministicId(seq),
            structuralCode: code,
            parentId: parentSeq ? InMemoryChartOfAccountsFillerService.generateDeterministicId(parentSeq) : null,
            name,
            description: `Grupo estrutural de ${name}`,
            accountClass,
            balanceType: InMemoryChartOfAccountsFillerService.calculateBalanceType(accountClass, false),
            isSummary: true,
            isContra: false,
            isActive: true
        });

        const accounts: AccountStorageSnapshot[] = [
            // ========================================================
            // 1. AS 5 CLASSES RAÍZES (Nível 1) - Sequências de 1 a 5
            // ========================================================
            createGroup(1, [1], 'ATIVO', 'asset'),
            createGroup(2, [2], 'PASSIVO', 'liability'),
            createGroup(3, [3], 'PATRIMÔNIO LÍQUIDO', 'equity'),
            createGroup(4, [4], 'RECEITAS', 'income'),
            createGroup(5, [5], 'DESPESAS', 'expense'),

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

        for (const account of accounts) 
            database.accountsById.set(account.id,account);
    }

    /**
    * Helper privado para gerar o UUID determinístico baseado em um número de sequência
    */
    private static generateDeterministicId(sequence: number): string {
        return `00000000-0000-4000-8000-${sequence.toString().padStart(12, '0')}`;
    }

    private static calculateBalanceType(accountClass: AccountClassEnum | `${AccountClassEnum}`, isContra: boolean): BalanceTypeEnum {
        return [AccountClassEnum.ASSET, AccountClassEnum.EXPENSE]
            .includes(accountClass as AccountClassEnum) !== isContra ? BalanceTypeEnum.DEBIT : BalanceTypeEnum.CREDIT;
    }

}
