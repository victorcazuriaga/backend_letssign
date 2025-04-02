import { NestFactory } from '@nestjs/core';
import { NotificationModule } from './notification.module';
import { RmqService } from '@app/common';
import { RmqOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from '@app/common';
import '@app/common/sentry/instrument.ts';

async function bootstrap() {
  const app = await NestFactory.create(NotificationModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.connectMicroservice<RmqOptions>(rmqService.getOptions('NOTIFICATION'));
  const configService = app.get(ConfigService);
  await app.startAllMicroservices();
  await app.listen(configService.get<string | number>('PORT') || 3002);
}
bootstrap();
