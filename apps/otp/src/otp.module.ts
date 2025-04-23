import { Module } from '@nestjs/common';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { ConfigModule } from '@nestjs/config';
import { OtpRepository } from './repositories/otp.repository';
import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { OtpSchema } from './schemas/otp.schema';
import { DatabaseModule, RmqModule } from '@app/common';
import { NOTIFICATION_SERVICE } from '../constants/service';
import { MonitoringModule } from '@app/common/monitoring/monitoring.module';

// TODO: Move env varibles to a common place
@Module({
  imports: [
    DatabaseModule,
    MonitoringModule.forRoot({
      serviceName: 'otp',
      serviceVersion: '1.0.0',
      serviceType: 'event',
      metricsPath: '/metrics',
      dependencies: {
        mongodb: true,
        rabbitmq: true,
        services: [
          { name: 'auth-service', url: 'http://auth:3001/health/liveness' },
          {
            name: 'notification-service',
            url: 'http://notification:3003/health/liveness',
          },
        ],
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_OTP_QUEUE: Joi.string().required(),
      }),
      envFilePath: './apps/otp/.env',
    }),
    RmqModule.register({ name: NOTIFICATION_SERVICE }),
    MongooseModule.forFeature([{ name: 'Otp', schema: OtpSchema }]),
  ],
  controllers: [OtpController],
  providers: [OtpService, OtpRepository],
  exports: [OtpService],
})
export class OtpModule {}
