import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { DomainExceptionFilter } from './shared/presentation/filters/domain-exception.filter';
import { ValidationFilter, ValidationException } from './shared/presentation/filters/validation.filter';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './config/configuration';
import { generateOpenApiDocument } from './openapi';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService<AppConfig> = app.get(ConfigService);
  const { port, globalPrefix } = configService.getOrThrow('api', { infer: true });

  const document = generateOpenApiDocument(app);

  app.setGlobalPrefix(globalPrefix, { exclude: ['/', '/api'] });
  document.servers = [{ url: globalPrefix }];

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => new ValidationException(errors),
    }),
  );

  app.useGlobalFilters(new ValidationFilter());
  app.useGlobalFilters(new DomainExceptionFilter());

  app.enableCors();

  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
}
bootstrap();

function setupSwagger(app: INestApplication<any>) {
}