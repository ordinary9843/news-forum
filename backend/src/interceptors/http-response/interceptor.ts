import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class HttpResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { statusCode }: Response = context
      .switchToHttp()
      .getResponse<Response>();

    return next.handle().pipe(
      map((data: object) => {
        return {
          success: true,
          statusCode,
          message: 'Success',
          data,
        };
      }),
    );
  }
}
