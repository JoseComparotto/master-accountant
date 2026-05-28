import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SWAGGER_TAGS } from '@shared/constants/swagger.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ativa o class-validator globalmente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove qualquer campo que venha no JSON mas que não tenha decorador no DTO (Evita injeção de dados)
      forbidNonWhitelisted: true, // Retorna erro se o usuário mandar campos extras não mapeados
      transform: true, // Transforma automaticamente os tipos (ex: string '1' para number 1)
    }),
  );

  // Configuração do Swagger usando o dicionário central de tags
  const configBuilder = new DocumentBuilder()
    .setTitle('Core Accounting API')
    .setDescription('Motor Contábil de Alta Performance e Fonte Única de Verdade')
    .setVersion('0.0.1')

  // Injeta automaticamente todas as tags e descrições do seu dicionário central
  Object.values(SWAGGER_TAGS).forEach((tag) => {
    configBuilder.addTag(tag.name, tag.description);
  });

  // Gerar o documento Swagger a partir dos decoradores e do config
  const config = configBuilder.build();
  const document = SwaggerModule.createDocument(app, config);

  // Montagem do Swagger UI na rota '/api'
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
