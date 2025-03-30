import { Controller } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RmqService } from '@app/common';
import { IUserCreatedNotification } from './@types/notification.interface';

@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly rmqService: RmqService,
  ) {}
  @EventPattern('user.created')
  async handleUserCreated(
    @Payload() data: IUserCreatedNotification,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    await this.notificationService.sendNotification(
      data.email,
      'Bem-Vindo !',
      'welcome',
      data,
    );
    this.rmqService.ack(context);
  }
  @EventPattern('reset.password')
  async handleResetPassword(
    @Payload() data: { email: string; otpCode: string },
    @Ctx() context: RmqContext,
  ): Promise<void> {
    await this.notificationService.sendNotification(
      data.email,
      'Reset Password',
      'reset-password',
      data,
    );
    this.rmqService.ack(context);
  }
}
