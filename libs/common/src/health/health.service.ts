import { Inject, Injectable } from '@nestjs/common';
import {
  HealthCheckService,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  HttpHealthIndicator,
  MicroserviceHealthIndicator,
  HealthIndicatorFunction,
} from '@nestjs/terminus';
import { Transport } from '@nestjs/microservices';

@Injectable()
export class HealthService {
  constructor(
    @Inject('HEALTH_OPTIONS')
    private options: {
      serviceName: string;
      serviceVersion: string;
      dependencies: {
        mongodb?: boolean;
        redis?: boolean;
        rabbitmq?: boolean;
        services?: { name: string; url: string }[];
      };
    },
    private health: HealthCheckService,
    private mongoose: MongooseHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private http: HttpHealthIndicator,
    private microservice: MicroserviceHealthIndicator,
  ) {}

  async check() {
    const checks: HealthIndicatorFunction[] = [
      () => ({
        [this.options.serviceName]: {
          status: 'up',
          version: this.options.serviceVersion,
        },
      }),

      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
      () =>
        this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.9 }), // 90% máximo
    ];

    if (this.options.dependencies.mongodb) {
      checks.push(() => this.mongoose.pingCheck('mongodb'));
    }

    if (this.options.dependencies.redis) {
      //when implementing redis, use this line
    }

    if (this.options.dependencies.rabbitmq) {
      checks.push(() =>
        this.microservice.pingCheck('rabbitmq', {
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBIT_MQ_URI],
            queue: `${this.options.serviceName}_health_check_queue`,
          },
        }),
      );
    }

    if (this.options.dependencies.services) {
      for (const service of this.options.dependencies.services) {
        checks.push(() => this.http.pingCheck(service.name, service.url));
      }
    }

    return this.health.check(checks);
  }

  async checkLiveness() {
    return this.health.check([
      () => ({
        [this.options.serviceName]: { status: 'up' },
      }),
    ]);
  }

  async checkReadiness() {
    return this.check();
  }
}
