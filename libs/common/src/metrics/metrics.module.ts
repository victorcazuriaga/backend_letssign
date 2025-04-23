import { DynamicModule, Module } from '@nestjs/common';
import {
  PrometheusModule,
  makeCounterProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';
import { MetricsService } from './metrics.service';
import { HttpMetricsInterceptor } from './http-metrics.interceptor';
import { METRIC_NAMES } from './metrics.constants';
import { EventMetricsInterceptor } from './event-metrics.interceptor';

@Module({})
export class MetricsModule {
  static forRoot(options: {
    serviceName: string;
    serviceType: 'http' | 'event' | 'hybrid';
    defaultMetrics?: boolean;
    path?: string;
  }): DynamicModule {
    const metricsProviders = [
      makeHistogramProvider({
        name: METRIC_NAMES.HTTP_REQUEST_DURATION,
        help: 'Duração das requisições HTTP em segundos',
        labelNames: ['service', 'method', 'path', 'status'],
        buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
      }),
      makeCounterProvider({
        name: METRIC_NAMES.HTTP_REQUESTS_TOTAL,
        help: 'Total de requisições HTTP',
        labelNames: ['service', 'method', 'path', 'status'],
      }),
      makeHistogramProvider({
        name: METRIC_NAMES.EVENT_PROCESSING_DURATION,
        help: 'Duração do processamento de eventos em segundos',
        labelNames: ['service', 'pattern', 'success'],
        buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
      }),
      makeCounterProvider({
        name: METRIC_NAMES.EVENTS_PROCESSED_TOTAL,
        help: 'Total de eventos processados',
        labelNames: ['service', 'pattern', 'success'],
      }),
    ];
    const interceptors: Array<{ provide: string; useClass: any }> = [];
    if (options.serviceType === 'http' || options.serviceType === 'hybrid') {
      interceptors.push({
        provide: 'APP_INTERCEPTOR' as const,
        useClass: HttpMetricsInterceptor,
      });
    }
    if (options.serviceType === 'event' || options.serviceType === 'hybrid') {
      interceptors.push({
        provide: 'APP_INTERCEPTOR',
        useClass: EventMetricsInterceptor,
      });
    }
    return {
      module: MetricsModule,
      imports: [
        PrometheusModule.register({
          path: options.path || '/metrics',
          defaultMetrics: {
            enabled: options.defaultMetrics !== false,
          },
        }),
      ],
      providers: [
        ...metricsProviders,
        ...interceptors,
        {
          provide: 'METRICS_OPTIONS',
          useValue: {
            serviceName: options.serviceName,
            serviceType: options.serviceType,
          },
        },
        MetricsService,
        HttpMetricsInterceptor,
      ],
      exports: [
        'METRICS_OPTIONS',
        MetricsService,
        HttpMetricsInterceptor,
        PrometheusModule,
        ...metricsProviders,
      ],
    };
  }
}
