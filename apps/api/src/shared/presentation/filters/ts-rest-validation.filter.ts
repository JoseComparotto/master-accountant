import {
  Logger,
  Catch,
  ExceptionFilter,
  ArgumentsHost,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { RequestValidationError } from '@ts-rest/nest';
import { ApiErrorDto } from "@repo/contracts"

const MESSAGE_FALLBACK = 'Falha na validação dos dados enviados.';

@Catch(RequestValidationError)
export class TsRestValidationFilter implements ExceptionFilter {
  private readonly logger = new Logger(TsRestValidationFilter.name);

  catch(exception: RequestValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();

    // O ts-rest joga os resultados do Zod aqui dentro
    const validationError: any = exception.getResponse();

    const message = typeof validationError === 'string' ? validationError : MESSAGE_FALLBACK;

    // Extrai os "issues" do Zod de cada parte da requisição
    const issues = [
      ...(validationError?.bodyResult ? validationError.bodyResult.issues : []),
      ...(validationError?.queryResult ? validationError.queryResult.issues : []),
      ...(validationError?.paramsResult ? validationError.paramsResult.issues : []),
      ...(validationError?.headersResult ? validationError.headersResult.issues : []),
    ];

    // Formata os erros no seu padrão
    const errors = issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      rule: issue.code,
    }));

    const errorBody: ApiErrorDto = {
      statusCode: status,
      path: request.url,
      message: message,
      details: errors.length > 0 ? { errors } : undefined,
      timestamp: new Date().toISOString(),
    };

    this.logger.warn(
      `${request.method} ${request.url} - Status: ${status} - Message: ${errorBody.message}`
    );

    return response.status(status).json(errorBody);
  }

}