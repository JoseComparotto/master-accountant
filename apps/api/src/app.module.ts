import { Module } from '@nestjs/common';
import { ChartOfAccountsModule } from './modules/chart-of-accounts/chart-of-accounts.module';

@Module({
  imports: [
    ChartOfAccountsModule,
  ],
})
export class AppModule {}
