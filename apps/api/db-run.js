const { MikroORM } = require('@mikro-orm/core');
const path = require('path');

async function main() {
  const action = process.argv[2];
  
  // 1. Importa a configuração que já foi compilada pelo NestJS na pasta dist
  const configPath = path.resolve(__dirname, 'dist/src/shared/infrastructure/db/mikro-orm.config.js');
  const configModule = require(configPath);
  const config = configModule.default || configModule;

  const seedersPath = config.seeder.path;
  const defaultSeederName = config.seeder.defaultSeeder;
  const defaultSeederPath = path.resolve(__dirname, seedersPath);
  const defaultSeeder = require(defaultSeederPath)[defaultSeederName];

  console.log(`📦 Inicializando MikroORM para a ação: [${action}]...`);
  
  // 2. Força o modo JS limpando as rotas TS para blindar o runtime contra o Jiti
  const orm = await MikroORM.init({
    ...config,
    entitiesTs: [],
  });

  try {
    if (action === 'up') {
      console.log('🚀 Executando migrações pendentes...');
      const migrated = await orm.migrator.up();
      console.log(`✅ Sucesso! Migrações aplicadas: ${migrated.length}`);
    } 
    else if (action === 'create') {
      console.log('✏️ Gerando nova migração baseada no Schema Diff...');
      const migration = await orm.migrator.createMigration();
      console.log(`✅ Sucesso! Arquivo criado: ${migration.fileName}`);
    } 
    else if (action === 'seed') {
      console.log('🌱 Semeando banco de dados...');
      await orm.seeder.seed(defaultSeeder);
      console.log('✅ Sucesso! Seeders executados.');
    } 
    else {
      console.error('❌ Ação desconhecida! Use: up, create ou seed');
    }
  } finally {
    await orm.close(true);
  }
}

main().catch((err) => {
  console.error('❌ Erro crítico na execução do banco de dados:', err);
  process.exit(1);
});