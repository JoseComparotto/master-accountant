import { defineConfig } from '@mikro-orm/sqlite';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Migrator } from '@mikro-orm/migrations';

export default defineConfig({
  dbName: process.env.DATABASE_URL,
  pool: { min: 1, max: 1 },

  metadataProvider: TsMorphMetadataProvider,

  entities: ['dist/**/*.orm-entity.js'],
  entitiesTs: ['src/**/*.orm-entity.ts'],

  discovery: {
    tsConfigPath: 'tsconfig.json', 
    warnWhenNoEntities: true,
  },

  extensions: [Migrator],

  migrations: {
    path: 'dist/src/shared/infrastructure/db/migrations',
    pathTs: 'src/shared/infrastructure/db//migrations',
  },

  seeder: {
    path: 'dist/src/shared/infrastructure/db/seeders',
    pathTs: 'src/shared/infrastructure/db/seeders',
    defaultSeeder: 'DatabaseSeeder',
  },

});