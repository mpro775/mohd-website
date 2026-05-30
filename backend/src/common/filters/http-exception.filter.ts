import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { IResponse, IValidationError } from '../interfaces/response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'حدث خطأ داخلي في الخادم';
    let errors: IValidationError[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;

        // Handle validation errors
        if (Array.isArray(responseObj.message)) {
          message = 'خطأ في التحقق من البيانات';
          errors = responseObj.message.map((msg: string) => ({
            field: this.extractFieldName(msg),
            message: msg,
          }));
        } else if (responseObj.errors) {
          errors = responseObj.errors;
        }
      } else {
        message = exceptionResponse;
      }
    } else if (exception && (exception as any).name === 'CastError') {
      status = HttpStatus.BAD_REQUEST;
      message = `قيمة غير صالحة للحقل ${(exception as any).path}: ${(exception as any).value}`;
    } else if (exception instanceof Error) {
      message =
        process.env.NODE_ENV === 'production'
          ? 'حدث خطأ داخلي في الخادم'
          : exception.message;
    }

    const errorResponse: IResponse = {
      success: false,
      statusCode: status,
      message,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }

  private extractFieldName(message: string): string {
    // Try to extract field name from validation message
    const match = message.match(/^(\w+)\s/);
    return match ? match[1] : 'unknown';
  }
}
