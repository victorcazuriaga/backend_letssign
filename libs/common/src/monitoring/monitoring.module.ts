import { DynamicModule, Module } from '@nestjs/common';
import { MetricsModule } from '../metrics/metrics.module';
import { HealthModule } from '../health/health.module';
import { metricsProviders } from '../metrics/metrics.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpMetricsInterceptor } from '../metrics/http-metrics.interceptor';

@Module({})
export class MonitoringModule {
  static forRoot(options: {
    serviceName: string;
    serviceVersion: string;
    serviceType: 'http' | 'event' | 'hybrid';
    metricsPath?: string;
    dependencies?: {
      mongodb?: boolean;
      redis?: boolean;
      rabbitmq?: boolean;
      services?: { name: string; url: string }[];
    };
  }): DynamicModule {
    return {
      module: MonitoringModule,
      imports: [
        MetricsModule.forRoot({
          serviceName: options.serviceName,
          serviceType: options.serviceType,
          path: options.metricsPath,
          defaultMetrics: true,
        }),
        HealthModule.forRoot({
          serviceName: options.serviceName,
          serviceVersion: options.serviceVersion,
          dependencies: options.dependencies,
        }),
      ],
      providers: [
        ...metricsProviders,
        {
          provide: APP_INTERCEPTOR,
          useClass: HttpMetricsInterceptor,
        },
      ],
      exports: [MetricsModule, HealthModule],
    };
  }
}
