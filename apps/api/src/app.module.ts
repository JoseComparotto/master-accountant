import { Module } from '@nestjs/common';
import { ChartOfAccountsModule } from './modules/chart-of-accounts/chart-of-accounts.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ChartOfAccountsModule,
  ],
  controllers:[
    AppController
  ]
})
export class AppModule {}
