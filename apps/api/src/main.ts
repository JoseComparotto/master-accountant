import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { DomainExceptionFilter } from './shared/presentation/filters/domain-exception.filter';
import { openApiDocument } from '@repo/contracts';
import { TsRestValidationFilter } from './shared/presentation/filters/ts-rest-validation.filter';
import { INestApplication } from '@nestjs/common';

const globalPrefix = process.env.GLOBAL_PREFIX ?? '/api';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(globalPrefix, { exclude: ['/', '/api'] });

  app.enableCors();

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

function setupSwagger(app: INestApplication<any>) {
  app.useGlobalFilters(new TsRestValidationFilter());
  app.useGlobalFilters(new DomainExceptionFilter());

  const docs: OpenAPIObject = {
    ...openApiDocument,
    servers: [
      { url: globalPrefix }
    ]
  };

  SwaggerModule.setup('docs', app, docs);
}
