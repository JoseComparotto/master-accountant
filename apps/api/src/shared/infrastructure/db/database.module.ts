import { MiddlewareConsumer, Module } from "@nestjs/common";
import { MikroOrmMiddleware, MikroOrmModule } from "@mikro-orm/nestjs";

import config from "./mikro-orm.config"

@Module({
  imports: [
    MikroOrmModule.forRoot(config),
  ],
})
export class DatabaseModule {
    // Segurança do MikroORM:
  configure(consumer: MiddlewareConsumer) {
    // Isso aplica o Unit of Work (Identity Map) isolado para toda requisição REST.
    // Se a requisição der erro no meio, o MikroORM não salva nada (rollback em memória).
    consumer.apply(MikroOrmMiddleware).forRoutes('*');
  }
}