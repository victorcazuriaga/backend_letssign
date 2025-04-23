import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { EventMetricsInterceptor } from './event-metrics.interceptor';

export function TrackEventMetrics() {
  return applyDecorators(UseInterceptors(EventMetricsInterceptor));
}
