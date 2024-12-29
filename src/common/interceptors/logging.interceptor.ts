import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;

    console.log(`[${method}] ${url} - ${new Date().toLocaleString()}`);

    return next.handle().pipe(
      tap(() => {
        console.log(
          `[${method}] ${url} - ${new Date().toLocaleString()} - Completed`
        );
      })
    );
  }
}
