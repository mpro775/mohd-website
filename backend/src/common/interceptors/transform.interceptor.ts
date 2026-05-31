import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IResponse } from '../interfaces/response.interface';

const ENVELOPE_KEYS = [
  'success',
  'statusCode',
  'message',
  'data',
  'meta',
  'links',
  'errors',
  'timestamp',
  'path',
];

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  IResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const statusCode = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      map((data) => {
        if (this.isWrappedResponse(data)) {
          return {
            ...data,
            statusCode: data.statusCode ?? statusCode,
            timestamp: data.timestamp ?? new Date().toISOString(),
            path: data.path ?? request.url,
          };
        }

        const isEnvelope = this.isControllerEnvelope(data);
        const response: IResponse<T> = {
          success: true,
          statusCode,
          message: isEnvelope
            ? data.message || 'Operation completed successfully'
            : 'Operation completed successfully',
          data: isEnvelope
            ? data.data !== undefined
              ? data.data
              : null
            : data,
          timestamp: new Date().toISOString(),
          path: request.url,
        };

        if (isEnvelope && data.meta !== undefined) {
          response.meta = data.meta;
        }
        if (isEnvelope && data.links !== undefined) {
          response.links = data.links;
        }

        return response;
      }),
    );
  }

  private isRecord(value: unknown): value is Record<string, any> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  private isWrappedResponse(value: unknown): value is IResponse<T> {
    return (
      this.isRecord(value) &&
      typeof value.success === 'boolean' &&
      typeof value.statusCode === 'number' &&
      typeof value.message === 'string'
    );
  }

  private isControllerEnvelope(value: unknown): value is Record<string, any> {
    return (
      this.isRecord(value) &&
      ENVELOPE_KEYS.some((key) =>
        Object.prototype.hasOwnProperty.call(value, key),
      )
    );
  }
}
