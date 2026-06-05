import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Type, Logger } from '@nestjs/common';
import { Response, Request } from 'express';
import { BusinessRuleViolationException, DomainException, EntityAlreadyExistsException, EntityNotExistsException } from '@repo/core';
import { ApiErrorResponseDto } from '../../presentation/dto/api-error-response.dto';

const DOMAIN_STATUS_MAP = new Map<Type<DomainException>, HttpStatus>([
  [EntityNotExistsException, HttpStatus.NOT_FOUND], // 404
  [EntityAlreadyExistsException, HttpStatus.CONFLICT], // 409
  [BusinessRuleViolationException, HttpStatus.UNPROCESSABLE_ENTITY], // 422
]);

const DOMAIN_STATUS_FALLBACK = HttpStatus.BAD_REQUEST;

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {

  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let status = DOMAIN_STATUS_FALLBACK;

    for (const [ExceptionClass, httpStatus] of DOMAIN_STATUS_MAP) {
      if (exception instanceof ExceptionClass) {
        status = httpStatus;
        break;
      }
    }

    const errorBody: ApiErrorResponseDto = { 
      statusCode: status,
      path: request.url,
      error: exception.name,
      message: exception.message,
      details: exception.metadata,
      timestamp: new Date().toISOString(),
    };

    // Log estratégico para monitoramento de saúde da API em produção
    this.logger.warn(
      `[${errorBody.error}] ${request.method} ${request.url} - Status: ${status} - Message: ${errorBody.message}`
    );
    
    // Retorna a resposta tipada
    return response.status(status).json(errorBody);
  }
}