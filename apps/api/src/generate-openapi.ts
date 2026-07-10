import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { generateOpenApiDocument } from './openapi';
import * as fs from 'fs';
import * as path from 'path';

async function generate() {

    const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });

    const document = generateOpenApiDocument(app);

    const outputPath = path.resolve(__dirname, '../../../../packages/shared/sdk/openapi.json');

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));

    console.log(`✅ Artefato OpenAPI unificado gerado em: ${outputPath}`);

    await app.close();
    process.exit(0);
}

generate().catch((err) => {
    console.error('❌ Falha crítica ao exportar contrato OpenAPI:', err);
    process.exit(1);
});