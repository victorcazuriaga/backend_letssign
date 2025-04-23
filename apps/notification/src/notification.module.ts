import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { DatabaseModule } from '@app/common/database/database.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { EmailAdapter } from './adapters/email.adapter';
import { DiscordAdapter } from './adapters/discord.adapter';
import { RmqModule, RmqService } from '@app/common';
import { MonitoringModule } from '@app/common/monitoring/monitoring.module';
@Module({
  imports: [
    DatabaseModule,
    RmqModule,
    MonitoringModule.forRoot({
      serviceName: 'notification',
      serviceVersion: '1.0.0',
      serviceType: 'event',
      metricsPath: '/metrics',
      dependencies: {
        mongodb: true,
        rabbitmq: true,
        services: [
          { name: 'otp-service', url: 'http://otp:3002/health/liveness' },
          {
            name: 'notification-service',
            url: 'http://notification:3003/health/liveness',
          },
          {
            name: 'auth-service',
            url: 'http://auth:3001/health/liveness',
          },
        ],
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_NOTIFICATION_QUEUE: Joi.string().required(),
      }),
      envFilePath: './apps/notification/.env',
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, EmailAdapter, DiscordAdapter, RmqService],
})
export class NotificationModule {}
