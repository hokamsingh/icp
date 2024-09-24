import { isAxiosError } from 'axios';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const hostType = host.getType();
    if (hostType === 'http') {
      // In certain situations `httpAdapter` might not be available in the
      // constructor method, thus we should resolve it here.
      const { httpAdapter } = this.httpAdapterHost;

      const ctx = host.switchToHttp();

      const httpStatus =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

      // TODO: Create DTO to transmit the error response to the client
      const responseBody =
        exception instanceof HttpException
          ? exception.getResponse()
          : {
              status: httpStatus,
              message:
                exception instanceof Error && !isAxiosError(exception)
                  ? exception.message
                  : 'Internal server error',
            };

      httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
  }
}
