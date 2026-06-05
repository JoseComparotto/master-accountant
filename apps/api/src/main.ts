import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SWAGGER_API_INFO, SWAGGER_TAGS_ARRAY } from './shared/constants/swagger.constants';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DomainExceptionFilter } from './shared/presentation/filters/domain-exception.filter';

function setupSwagger(app: INestApplication<any>) {

  const { title, description, version, license, } = SWAGGER_API_INFO

  const configBuilder = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(version)
    .setLicense(license.name, license.url);

  for (const tag of SWAGGER_TAGS_ARRAY) {
    configBuilder.addTag(
      tag.name,
      tag.description,
      tag.externalDocs,
      {
        kind: tag.kind,
        parent: tag.parent,
        summary: tag.summary
      }
    )
  }

  const config = configBuilder.build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}

function setupClassValidator(app: INestApplication<any>){
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove qualquer campo que venha no JSON mas que não tenha decorador no DTO (Evita injeção de dados)
      forbidNonWhitelisted: true, // Retorna erro se o usuário mandar campos extras não mapeados
      transform: true, // Transforma automaticamente os tipos (ex: string '1' para number 1)
    }),
  );
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  
  app.useGlobalFilters(new DomainExceptionFilter());

  setupSwagger(app);

  setupClassValidator(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();