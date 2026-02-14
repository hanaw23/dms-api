import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodError } from 'zod';

@Catch()
export class ErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      return response.status(status).json({
        errors: exceptionResponse,
      });
    }

    if (exception instanceof ZodError) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        errors: exception.errors,
      });
    }

    // Default error
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      errors: exception.message || 'Internal server error',
    });
  }
}
