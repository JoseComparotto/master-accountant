import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MikroOrmModule, MikroOrmMiddleware } from '@mikro-orm/nestjs';
import { ChartOfAccountsModule } from './modules/chart-of-accounts/chart-of-accounts.module';
import mikroOrmConfig from './mikro-orm.config';

@Module({
  imports: [
    // 1. Inicializa o banco de dados globalmente
    MikroOrmModule.forRoot(mikroOrmConfig),
    
    // 2. Importa o primeiro Domínio de Negócio
    ChartOfAccountsModule,
    
    // Futuramente, outros domínios entram aqui:
    // JournalModule, ReconciliationModule, etc.
  ],
})
export class AppModule implements NestModule {
  // Segurança do MikroORM:
  configure(consumer: MiddlewareConsumer) {
    // Isso aplica o Unit of Work (Identity Map) isolado para toda requisição REST.
    // Se a requisição der erro no meio, o MikroORM não salva nada (rollback em memória).
    consumer.apply(MikroOrmMiddleware).forRoutes('*');
  }
}