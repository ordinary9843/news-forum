import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class HttpResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { statusCode } = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((result: object) => {
        return {
          success: true,
          statusCode,
          message: 'Success',
          result,
        };
      }),
    );
  }
}
