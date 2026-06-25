import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { ChartOfAccountsOrmEntity } from '../../../../modules/coa/infrastructure/db';
import { AccountClassEnum, AccountNameValue, ChartOfAccountsEntity } from '@repo/coa-core';
import { UuidValue } from '@repo/shared-core';
import { ChartOfAccountsMapper } from '../../../../modules/coa/infrastructure/db/mappers/chart-of-accounts.mapper';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    if ((await em.count(ChartOfAccountsOrmEntity)) > 0) {
      console.warn('⚠️ [Seeder Abortado] O banco já possui dados. Não é um ambiente limpo.');
      return;
    }

    const chart = ChartOfAccountsEntity.create();

    if (process.env.SEED_ACCOUNTS === 'true') {
      this.seedAccounts(chart);
    }

    const chartOrm = new ChartOfAccountsOrmEntity();
    chartOrm.id = UuidValue.create(process.env.DEFAULT_CHART_ID).value;
    ChartOfAccountsMapper.toPersistence(chart, chartOrm);

    em.persist(chartOrm);
  }

  private seedAccounts(chart: ChartOfAccountsEntity): void {
    const accountTreeStructure = [
      {
        index: 1, name: 'ATIVO', class: AccountClassEnum.ASSET, children: [
          'Ativo Circulante',
          'Ativo Não Circulante'
        ]
      },
      {
        index: 2, name: 'PASSIVO', class: AccountClassEnum.LIABILITY, children: [
          'Passivo Circulante',
          'Passivo Não Circulante'
        ]
      },
      {
        index: 3, name: 'PATRIMÔNIO LÍQUIDO', class: AccountClassEnum.EQUITY, children: [
          'Capital Social'
        ]
      },
      {
        index: 4, name: 'RECEITAS', class: AccountClassEnum.INCOME, children: [
          'Receitas Recorrentes',
          'Receitas Não Recorrentes',
        ]
      },
      {
        index: 5, name: 'DESPESAS', class: AccountClassEnum.EXPENSE, children: [
          'Despesas Recorrentes',
          'Despesas Não Recorrentes',
        ]
      },
    ];

    for (const { index, name, class: accountClass, children } of accountTreeStructure) {
      const root = chart.createRootAccount({
        localIndex: index,
        name: AccountNameValue.create(name),
        accountClass,
      });

      children.forEach(childName => {
        chart.createChildAccount({
          name: AccountNameValue.create(childName),
          parentId: root.id,
          isSummary: true,
        });
      });
    }
  }
}