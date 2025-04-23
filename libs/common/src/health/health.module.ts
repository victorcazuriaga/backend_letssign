import { DynamicModule, Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({})
export class HealthModule {
  static forRoot(options: {
    serviceName: string;
    serviceVersion: string;
    dependencies?: {
      mongodb?: boolean;
      redis?: boolean;
      rabbitmq?: boolean;
      services?: { name: string; url: string }[];
    };
  }): DynamicModule {
    return {
      module: HealthModule,
      imports: [TerminusModule, HttpModule],
      controllers: [HealthController],
      providers: [
        {
          provide: 'HEALTH_OPTIONS',
          useValue: {
            serviceName: options.serviceName,
            serviceVersion: options.serviceVersion,
            dependencies: options.dependencies || {},
          },
        },
        HealthService,
      ],
      exports: [HealthService, TerminusModule],
    };
  }
}
