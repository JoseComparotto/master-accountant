import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';

export function generateOpenApiDocument(app: INestApplication): OpenAPIObject {
    const config = new DocumentBuilder()
        .setTitle('Master Accountant API')
        .setVersion('0.0.1')
        .build();

    const document = SwaggerModule.createDocument(app, config);

    delete document.paths['/'];
    delete document.paths['/api'];

    return document;
}