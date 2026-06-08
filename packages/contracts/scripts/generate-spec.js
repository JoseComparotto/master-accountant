import * as fs from 'fs';
import * as path from 'path';
import { generateOpenApi } from '@ts-rest/open-api';
import { apiContract } from '../src/contract';

// 1. Gera o objeto OpenAPI Spec
const openApiSpec = generateOpenApi(apiContract, {
  info: {
    title: 'Master Accountant API',
    version: '0.0.1',
  },
});

// 2. Garante que a pasta de destino exista (ex: pasta dist)
const outputDir = path.join(import.meta.dirname, '../dist');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 3. Escreve o arquivo JSON físico
const outputPath = path.join(outputDir, 'openapi.json');
fs.writeFileSync(outputPath, JSON.stringify(openApiSpec, null, 2), 'utf-8');

console.log(`✨ Artefato OpenAPI gerado com sucesso na pasta dist.`);
