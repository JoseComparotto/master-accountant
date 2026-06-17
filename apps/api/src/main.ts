import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { DomainExceptionFilter } from './shared/presentation/filters/domain-exception.filter';
import { openApiDocument } from '@repo/coa-contracts';
import { TsRestValidationFilter } from './shared/presentation/filters/ts-rest-validation.filter';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService<AppConfig> = app.get(ConfigService);
  const { port, globalPrefix } = configService.getOrThrow('api', { infer: true });

  app.setGlobalPrefix(globalPrefix, { exclude: ['/', '/api'] });

  app.useGlobalFilters(new TsRestValidationFilter());
  app.useGlobalFilters(new DomainExceptionFilter());

  app.enableCors();

  setupSwagger(app, globalPrefix);

  await app.listen(port);
}
bootstrap();

function setupSwagger(app: INestApplication<any>, globalPrefix: string) {
  const docs: OpenAPIObject = {
    ...openApiDocument,
    servers: [
      { url: globalPrefix }
    ]
  };

  SwaggerModule.setup('docs', app, docs);
}
