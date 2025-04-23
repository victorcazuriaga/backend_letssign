// libs/common/src/health/health.controller.ts
import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheck } from '@nestjs/terminus';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(
    private healthService: HealthService,
    @Inject('HEALTH_OPTIONS')
    private options: { serviceName: string; serviceVersion: string },
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.healthService.check();
  }

  @Get('liveness')
  @HealthCheck()
  checkLiveness() {
    return this.healthService.checkLiveness();
  }

  @Get('readiness')
  @HealthCheck()
  checkReadiness() {
    return this.healthService.checkReadiness();
  }
}
