import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import _ from 'lodash';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const statusCode = this.getStatusCode(exception);
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
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    return statusCode;
  }

  private getMessage(exception: HttpException, statusCode: HttpStatus): string {
    let message =
      exception.message ||
      `${
        statusCode >= HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Server error'
          : 'Client error'
      }`;
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && 'message' in response) {
        message = _.isArray(response.message)
          ? response.message.shift()
          : response.message;
      }
    }

    return message;
  }
}
