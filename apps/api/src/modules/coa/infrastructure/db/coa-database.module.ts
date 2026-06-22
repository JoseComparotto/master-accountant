import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ChartOfAccountsOrmEntity } from './entities/chart-of-accounts.orm-entity';
import { AccountOrmEntity } from './entities/account.orm-entity';
import { MikroOrmChartOfAccountsRepository } from './repositories/mikro-orm-coa.repository';

@Module({
  imports: [
    MikroOrmModule.forFeature([ChartOfAccountsOrmEntity, AccountOrmEntity]),
  ],
  providers: [
    {
      provide: 'IChartOfAccountsRepository',
      useClass: MikroOrmChartOfAccountsRepository,
    },
  ],
  exports: ['IChartOfAccountsRepository'], 
})
export class CoaDatabaseModule {}