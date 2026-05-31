import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';
import { IResponse, IValidationError } from '../interfaces/response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const normalized = this.normalizeException(exception);
    const errorResponse: IResponse = {
      success: false,
      statusCode: normalized.status,
      message: normalized.message,
      errors: normalized.errors.length ? normalized.errors : undefined,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(normalized.status).json(errorResponse);
  }

  private normalizeException(exception: unknown): {
    status: number;
    message: string;
    errors: IValidationError[];
  } {
    if (exception instanceof HttpException) {
      return this.normalizeHttpException(exception);
    }

    if (this.isDuplicateKeyError(exception)) {
      const fields = Object.keys(
        exception.keyPattern ?? exception.keyValue ?? {},
      );
      return {
        status: HttpStatus.CONFLICT,
        message: 'Value already exists',
        errors: fields.length
          ? fields.map((field) => ({
              field,
              message: `${field} already exists`,
            }))
          : [{ field: 'unknown', message: 'Duplicate value already exists' }],
      };
    }

    if (exception instanceof MongooseError.CastError) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: `Invalid value for ${exception.path}`,
        errors: [
          {
            field: exception.path,
            message: `Invalid value: ${String(exception.value)}`,
          },
        ],
      };
    }

    if (exception instanceof MongooseError.ValidationError) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        errors: Object.values(exception.errors).map((error) => ({
          field: error.path,
          message: error.message,
        })),
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message:
        process.env.NODE_ENV === 'production' || !(exception instanceof Error)
          ? 'Internal server error'
          : exception.message,
      errors: [],
    };
  }

  private normalizeHttpException(exception: HttpException) {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    let message = exception.message;
    let errors: IValidationError[] = [];

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (exceptionResponse && typeof exceptionResponse === 'object') {
      const responseObj = exceptionResponse as Record<string, any>;
      if (Array.isArray(responseObj.message)) {
        message = 'Validation failed';
        errors = responseObj.message.map((msg: string) => ({
          field: this.extractFieldName(msg),
          message: msg,
        }));
      } else {
        message = responseObj.message || message;
      }

      if (Array.isArray(responseObj.errors)) {
        errors = responseObj.errors;
      }
    }

    return { status, message, errors };
  }

  private isDuplicateKeyError(
    exception: unknown,
  ): exception is { code: number; keyPattern?: object; keyValue?: object } {
    return (
      !!exception &&
      typeof exception === 'object' &&
      (exception as { code?: number }).code === 11000
    );
  }

  private extractFieldName(message: string): string {
    const match = message.match(/^([\w.]+)\s/);
    return match ? match[1] : 'unknown';
  }
}
