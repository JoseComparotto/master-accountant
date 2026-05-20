import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

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

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
