import { defineConfig, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

export default defineConfig({
  // Credenciais do PostgreSQL
  driver: PostgreSqlDriver,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  dbName: process.env.DB_NAME || 'accounting-core',

  // O MikroORM vai buscar as entidades de domínio de dentro da pasta "modules"
  // (padrão de organização em DDD)
  entities: ['dist/modules/**/domain/entities/*.entity.js'],
  entitiesTs: ['src/modules/**/domain/entities/*.entity.ts'],

  // O MetadataProvider lê as tipagens do TypeScript. 
  // Dispensa ter que escrever o tipo da coluna no decorator o tempo todo.
  metadataProvider: TsMorphMetadataProvider,

  // Pasta para o versionamento do banco
  migrations: {
    path: 'dist/migrations',
    pathTs: 'src/migrations',
  },

  // Loga as queries SQL no terminal em ambiente de desenvolvimento (muito útil)
  debug: process.env.NODE_ENV !== 'production',
});