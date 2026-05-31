import { ArgumentsHost } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  function mockHost() {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({ url: '/api/test' }),
      }),
    } as unknown as ArgumentsHost;
    return { host, status, json };
  }

  it('maps Mongo duplicate key errors to 409', () => {
    const filter = new HttpExceptionFilter();
    const { host, status, json } = mockHost();

    filter.catch({ code: 11000, keyPattern: { slug: 1 } }, host);

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 409,
        errors: [{ field: 'slug', message: 'slug already exists' }],
      }),
    );
  });
});
