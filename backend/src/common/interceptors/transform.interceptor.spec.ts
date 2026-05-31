import { ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
  const context = {
    switchToHttp: () => ({
      getRequest: () => ({ url: '/api/test' }),
      getResponse: () => ({ statusCode: 200 }),
    }),
  } as ExecutionContext;

  it('preserves pagination meta from controller envelopes', (done) => {
    const interceptor = new TransformInterceptor();
    interceptor
      .intercept(context, {
        handle: () =>
          of({
            message: 'Loaded',
            data: [],
            meta: { total: 0, page: 1 },
          }),
      })
      .subscribe((response) => {
        expect(response.success).toBe(true);
        expect(response.meta).toEqual({ total: 0, page: 1 });
        expect(response.data).toEqual([]);
        done();
      });
  });

  it('does not double-wrap an already wrapped response', (done) => {
    const interceptor = new TransformInterceptor();
    interceptor
      .intercept(context, {
        handle: () =>
          of({
            success: true,
            statusCode: 201,
            message: 'Wrapped',
            data: null,
            timestamp: 'now',
            path: '/api/test',
          }),
      })
      .subscribe((response) => {
        expect(response.statusCode).toBe(201);
        expect(response.message).toBe('Wrapped');
        done();
      });
  });
});
