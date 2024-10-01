import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

import { isArray } from 'lodash';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response: Response = host.switchToHttp().getResponse<Response>();
    const statusCode: HttpStatus = this.getStatusCode(exception);
    response
      .status(statusCode)
      .header('Content-Type', 'application/json; charset=utf-8')
      .send({
        success: false,
        statusCode,
        message: this.getMessage(exception, statusCode),
      });
  }

  private getStatusCode(exception: HttpException): HttpStatus {
    const statusCode: HttpStatus =
      exception instanceof HttpException
        ? (exception.getStatus() as HttpStatus)
        : HttpStatus.INTERNAL_SERVER_ERROR;

    return statusCode;
  }

  private getMessage(exception: HttpException, statusCode: number): string {
    let message: string =
      exception.message ||
      `${
        statusCode >= HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Server error'
          : 'Client error'
      }`;
    if (exception instanceof HttpException) {
      const response: string | object = exception.getResponse();
      if (typeof response === 'object' && 'message' in response) {
        message = isArray(response.message)
          ? (response.message.shift() as string)
          : (response.message as string);
      }
    }

    return message;
  }
}
