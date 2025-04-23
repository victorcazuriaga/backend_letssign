/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';
import { RmqContext } from '@nestjs/microservices';

@Injectable()
export class EventMetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(EventMetricsInterceptor.name);

  constructor(
    private readonly metricsService: MetricsService,
    @Inject('METRICS_OPTIONS')
    private options: { serviceName: string; serviceType: string },
  ) {
    if (!options?.serviceType) {
      throw new Error('METRICS_OPTIONS: serviceType é obrigatório');
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    try {
      if (!this.shouldTrackMetrics()) return next.handle();

      const pattern = this.safeGetPattern(context);
      const startTime = Date.now();

      return next.handle().pipe(
        tap({
          next: () => this.recordMetrics(pattern, true, startTime),
          error: (err) => {
            this.recordMetrics(pattern, false, startTime);
            this.logger.error(
              `Erro no processamento do evento: ${err.message}`,
              err.stack,
            );
          },
        }),
      );
    } catch (error) {
      this.logger.error(`Falha no interceptor: ${error.message}`, error.stack);
      return next.handle();
    }
  }

  private shouldTrackMetrics(): boolean {
    return ['event', 'hybrid'].includes(this.options.serviceType);
  }

  private safeGetPattern(context: ExecutionContext): string {
    try {
      const rmqContext = context.switchToRpc().getContext<RmqContext>();
      const pattern = rmqContext.getPattern();

      return pattern?.replace(/\d+/g, ':id') || 'unknown';
    } catch (error) {
      this.logger.error(`Erro ao obter pattern: ${error.message}`);
      return 'unknown';
    }
  }

  private recordMetrics(
    pattern: string,
    success: boolean,
    startTime: number,
  ): void {
    try {
      const duration = (Date.now() - startTime) / 1000;
      this.metricsService.recordEventProcessing(pattern, success, duration);
    } catch (error) {
      this.logger.error(`Falha ao registrar métricas: ${error.message}`);
    }
  }
}
