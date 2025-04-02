import { NestFactory } from '@nestjs/core';
import { GlobalExceptionFilter, RmqService } from '@app/common';
import { AuthModule } from './auth.module';
import { RmqOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import '@app/common/sentry/instrument.ts';

// #TODO: On Prod disable cors and set the origin to the frontend url
async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  app.use(cookieParser());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.enableCors({
    credentials: true,
    origin: ['http://localhost:8000', '*'],
  });
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice<RmqOptions>(rmqService.getOptions('AUTH', true));
  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);
  await app.startAllMicroservices();
  await app.listen(configService.get<string | number>('PORT') || 3000);
}
bootstrap();
