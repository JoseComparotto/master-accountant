import { Module } from '@nestjs/common';
import { ChartOfAccountsModule } from './modules/chart-of-accounts/chart-of-accounts.module';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration.js';

@Module({
  imports: [
    ChartOfAccountsModule,
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      ignoreEnvFile: true
    })
  ],
  controllers:[
    AppController
  ]
})
export class AppModule {}
