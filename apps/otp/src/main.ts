import { NestFactory } from '@nestjs/core';
import { OtpModule } from './otp.module';
import { RmqOptions } from '@nestjs/microservices';
import { RmqService } from '@app/common';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from '@app/common';
import '@app/common/sentry/instrument.ts';

async function bootstrap() {
  const app = await NestFactory.create(OtpModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.connectMicroservice<RmqOptions>(rmqService.getOptions('OTP'));
  const configService = app.get(ConfigService);
  await app.startAllMicroservices();
  await app.listen(configService.get<string | number>('PORT') || 3003);
}
bootstrap();
