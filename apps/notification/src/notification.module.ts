import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { DatabaseModule } from '@app/common/database/database.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { EmailAdapter } from './adapters/email.adapter';
import { DiscordAdapter } from './adapters/discord.adapter';
import { RmqModule, RmqService } from '@app/common';
@Module({
  imports: [
    DatabaseModule,
    RmqModule,
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
