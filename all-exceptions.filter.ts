import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export interface ErrorBody {
  statusCode: number;
  error: string;
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
  path: string;
  timestamp: string;
}

const STATUS_TEXT: Record<number, string> = {
  400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 409: 'Conflict',
  422: 'Unprocessable Entity', 429: 'Too Many Requests', 500: 'Internal Server Error', 503: 'Service Unavailable',
};

/** One consistent error shape. Never leaks stack traces, SQL, or Prisma internals to clients. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();
    const { status, code, message, details } = this.normalise(exception);

    if (status >= 500) this.logger.error({ err: exception, requestId: req.id }, 'Unhandled exception');

    const body: ErrorBody = {
      statusCode: status,
      error: STATUS_TEXT[status] ?? 'Error',
      code,
      message,
      ...(details !== undefined ? { details } : {}),
      requestId: req.id,
      path: req.url,
      timestamp: new Date().toISOString(),
    };
    res.status(status).json(body);
  }

  private normalise(e: unknown): { status: number; code: string; message: string; details?: unknown } {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      switch (e.code) {
        case 'P2002': return { status: 409, code: 'ALREADY_EXISTS', message: 'A record with these values already exists' };
        case 'P2025': return { status: 404, code: 'NOT_FOUND', message: 'Record not found' };
        case 'P2003': return { status: 409, code: 'RELATION_CONFLICT', message: 'Operation conflicts with related records' };
        default: return { status: 500, code: 'DATABASE_ERROR', message: 'Internal server error' };
      }
    }
    if (e instanceof HttpException) {
      const status = e.getStatus();
      const r = e.getResponse() as string | { message?: string | string[]; code?: string };
      const raw = typeof r === 'string' ? r : r.message;
      if (Array.isArray(raw)) return { status, code: 'VALIDATION_FAILED', message: 'Validation failed', details: raw };
      const code = typeof r === 'object' && r.code ? r.code : (STATUS_TEXT[status] ?? 'ERROR').toUpperCase().replace(/ /g, '_');
      return { status, code, message: raw ?? e.message };
    }
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, code: 'INTERNAL_ERROR', message: 'Internal server error' };
  }
}
