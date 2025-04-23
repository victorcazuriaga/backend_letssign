import { Inject, Injectable } from '@nestjs/common';
import {
  InjectMetric,
  makeCounterProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { METRIC_NAMES } from './metrics.constants';

@Injectable()
export class MetricsService {
  constructor(
    @Inject('METRICS_OPTIONS')
    private options: { serviceName: string; serviceType: string },

    @InjectMetric(METRIC_NAMES.HTTP_REQUEST_DURATION)
    private readonly httpRequestDuration: Histogram<string>,

    @InjectMetric(METRIC_NAMES.HTTP_REQUESTS_TOTAL)
    private readonly httpRequestsTotal: Counter<string>,

    @InjectMetric(METRIC_NAMES.EVENT_PROCESSING_DURATION)
    private readonly eventProcessingDuration: Histogram<string>,

    @InjectMetric(METRIC_NAMES.EVENTS_PROCESSED_TOTAL)
    private readonly eventsProcessedTotal: Counter<string>,
  ) {}

  recordHttpRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
  ): void {
    const labels = {
      service: this.options.serviceName,
      method,
      path,
      status: statusCode.toString(),
    };

    this.httpRequestsTotal.inc(labels);
    this.httpRequestDuration.observe(labels, duration);
  }

  recordEventProcessing(
    pattern: string,
    success: boolean,
    duration: number,
  ): void {
    const labels = {
      service: this.options.serviceName,
      pattern,
      success: success.toString(),
    };

    this.eventsProcessedTotal.inc(labels);
    this.eventProcessingDuration.observe(labels, duration);
  }
}

export const metricsProviders = [
  makeHistogramProvider({
    name: METRIC_NAMES.HTTP_REQUEST_DURATION,
    help: 'Duração das requisições HTTP em segundos',
    labelNames: ['service', 'method', 'path', 'status'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
  }),

  makeCounterProvider({
    name: METRIC_NAMES.HTTP_REQUESTS_TOTAL,
    help: 'Número total de requisições HTTP',
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
    help: 'Número total de eventos processados',
    labelNames: ['service', 'pattern', 'success'],
  }),
];
