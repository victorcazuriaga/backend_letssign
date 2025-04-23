/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  private excludedPaths = ['/metrics', '/health'];
  constructor(
    private readonly metricsService: MetricsService,
    @Inject('METRICS_OPTIONS')
    private options: { serviceName: string; serviceType: string },
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (
      this.options.serviceType !== 'http' &&
      this.options.serviceType !== 'hybrid'
    ) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { method, path } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const statusCode = context.switchToHttp().getResponse().statusCode;
          const duration = (Date.now() - startTime) / 1000;
          this.metricsService.recordHttpRequest(
            method,
            path,
            statusCode,
            duration,
          );
        },
        error: (error) => {
          const statusCode = error.status || 500;
          const duration = (Date.now() - startTime) / 1000;
          this.metricsService.recordHttpRequest(
            method,
            path,
            statusCode,
            duration,
          );
        },
      }),
    );
  }
}
