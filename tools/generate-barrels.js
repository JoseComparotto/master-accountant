import fs from 'node:fs';
import path from 'node:path';

// Define o diretório 'src' do pacote que invocou o script
const SRC_DIR = path.resolve('src');
const OUTPUT_FILE = path.join(SRC_DIR, 'index.ts');

function generateBarrels() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`[Barrels] Erro: Diretorio 'src' não encontrado em: ${SRC_DIR}`);
    process.exit(1);
  }

  // Lê todos os ficheiros recursivamente dentro de src (Requer Node.js 18.17+ ou 20+)
  const allFiles = fs.readdirSync(SRC_DIR, { recursive: true });
  const exportStatements = [];

  for (const file of allFiles) {
    // Normaliza as barras para o padrão POSIX (evita problemas no Windows)
    const relativePath = file.replace(/\\/g, '/');

    // 1. RESOLVE O AUTO-IMPORT: Ignora qualquer arquivo index.ts, testes ou mocks
    if (
      relativePath.endsWith('index.ts') ||
      relativePath.endsWith('.spec.ts') ||
      relativePath.endsWith('.test.ts') ||
      relativePath.includes('mock')
    ) {
      continue;
    }

    // Filtra apenas ficheiros TypeScript de código (ignora definições .d.ts)
    if (relativePath.endsWith('.ts') && !relativePath.endsWith('.d.ts')) {
      // Remove a extensão original '.ts'
      const baseCaminho = relativePath.slice(0, -3);
      
      // 2. RESOLVE O TS2835: Injeta explicitamente o sufixo '.js' exigido pelo ESM
      exportStatements.push(`export * from './${baseCaminho}.js';`);
    }
  }

  // Monta o conteúdo do barrel
  const fileContent = [
    '// Ficheiro gerado automaticamente pelo pipeline. Não editar manualmente.',
    '',
    exportStatements.join('\n'),
    ''
  ].join('\n');

  // Escreve o novo index.ts de forma atómica
  fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf-8');
  console.log(`\x1b[32m[Barrels]\x1b[0m Sucesso! ${exportStatements.length} exports gerados com extensão ESM em @repo/core.`);
}

generateBarrels();