import 'dotenv/config';

import { defineConfig, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

export default defineConfig({
  // Credenciais do PostgreSQL
  driver: PostgreSqlDriver,
  clientUrl: process.env.DATABASE_URL, // Se estiver usando DATABASE_URL, ele ignora as outras configs

  // O MikroORM vai buscar as entidades de domínio de dentro da pasta "modules"
  // (padrão de organização em DDD)
  entities: ['dist/**/*.entity.js'], // Procura em qualquer lugar dentro de dist
  entitiesTs: ['src/**/*.entity.ts'], // Procura em qualquer lugar dentro de src

  // O MetadataProvider lê as tipagens do TypeScript. 
  // Dispensa ter que escrever o tipo da coluna no decorator o tempo todo.
  metadataProvider: TsMorphMetadataProvider,
  discovery: {
    tsConfigPath: './tsconfig.json', // Nota: 'C' maiúsculo e dentro de discovery
    warnWhenNoEntities: true,      // Opcional: ajuda a debugar se nada for encontrado
  },

  // Configuração para o sistema de migrações do MikroORM
  extensions: [Migrator],

  // Pasta para o versionamento do banco
  migrations: {
    path: 'dist/src/migrations',
    pathTs: 'src/migrations',
  },

  // Loga as queries SQL no terminal em ambiente de desenvolvimento (muito útil)
  debug: process.env.NODE_ENV !== 'production',
});