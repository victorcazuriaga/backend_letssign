import { Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { RmqService } from '@app/common';

@Controller('otp')
export class OtpController {
  constructor(
    private readonly otpService: OtpService,
    private readonly rmqService: RmqService,
  ) {}

  @EventPattern('otp.request')
  async handleGenerateOtp(
    @Payload() data: { email: string },
    @Ctx() context: RmqContext,
  ): Promise<void> {
    this.rmqService.ack(context);
    await this.otpService.sendOtp(data.email);
  }

  @Post()
  @MessagePattern('otp.validate')
  async handleOtpValidate(
    @Payload() data: { email: string; otp: string },
    @Ctx() context: RmqContext,
  ): Promise<{ status: string; message: string }> {
    const response = await this.otpService.validateOtp(data.email, data.otp);
    this.rmqService.ack(context);
    return response;
  }
}
