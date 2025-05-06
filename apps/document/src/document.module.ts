import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import {
  AuthModule,
  DatabaseModule,
  JwtAuthGuard,
  RmqModule,
  RmqService,
} from '@app/common';
import { ConfigModule } from '@nestjs/config';
import { R2Adapter } from './adapters/r2-storage.adapter';
import { DocumentRepository } from './repositories/document.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentSchema } from './schemas/document.schema';
import { MonitoringModule } from '@app/common/monitoring/monitoring.module';

@Module({
  imports: [
    DatabaseModule,
     MonitoringModule.forRoot({
          serviceName: 'document',
          serviceVersion: '1.0.0',
          serviceType: 'http',
          metricsPath: '/metrics',
          dependencies: {
            mongodb: true,
            rabbitmq: true,
            services: [
              { name: 'auth-service', url: 'http://localhost:3001/health/liveness' },
            ],
          },
        }),
    MongooseModule.forFeature([{ name: 'Document', schema: DocumentSchema }]),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_DOCUMENT_QUEUE: Joi.string().required(),
        MONGODB_URI: Joi.string().required(),
      }),
      envFilePath: './apps/document/.env',
    }),
    RmqModule,
    AuthModule,
  ],
  controllers: [DocumentController],
  providers: [
    DocumentService,
    JwtAuthGuard,
    R2Adapter,
    RmqService,
    DocumentRepository,
  ],
})
export class DocumentModule {}
