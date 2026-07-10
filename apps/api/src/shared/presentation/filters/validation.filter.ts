import {
  Logger,
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ValidationError } from 'class-validator';

const MESSAGE_FALLBACK = 'Falha na validação dos dados enviados.';

// Exceção customizada para isolar erros do class-validator
export class ValidationException extends BadRequestException {
  constructor(public readonly validationErrors: ValidationError[]) {
    super(MESSAGE_FALLBACK);
  }
}

@Catch(ValidationException)
export class ValidationFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationFilter.name);

  catch(exception: ValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const errors: Array<{ field: string; message: string; rule: string }> = [];

    // Função recursiva para varrer erros simples, em arrays ou objetos aninhados
    const flattenErrors = (validationErrors: ValidationError[], parentPath = '') => {
      for (const error of validationErrors) {
        const currentPath = parentPath ? `${parentPath}.${error.property}` : error.property;
        
        // Se houver restrições violadas neste nível
        if (error.constraints) {
          for (const [rule, message] of Object.entries(error.constraints)) {
            errors.push({
              field: currentPath,
              message: message,
              rule: rule, // Ex: 'isString', 'minLength', 'isUUID'
            });
          }
        }

        // Se houver filhos (validação aninhada/recursiva em arrays ou sub-objetos)
        if (error.children && error.children.length > 0) {
          flattenErrors(error.children, currentPath);
        }
      }
    };

    // Executa o achatamento dos erros vindos do class-validator
    flattenErrors(exception.validationErrors);

    const errorBody = {
      statusCode: status,
      path: request.url,
      message: exception.message,
      details: errors.length > 0 ? { errors } : undefined,
      timestamp: new Date().toISOString(),
    };

    this.logger.warn(
      `${request.method} ${request.url} - Status: ${status} - Message: ${errorBody.message}`
    );

    return response.status(status).json(errorBody);
  }
}