import { NestFactory } from '@nestjs/core';
import { DocumentModule } from './document.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(DocumentModule);
  const configService = app.get(ConfigService);
  await app.listen(configService.get<string | number>('PORT') || 3004);
}
bootstrap();
