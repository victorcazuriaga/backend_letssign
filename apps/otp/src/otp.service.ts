import { Injectable, Inject } from '@nestjs/common';
import { authenticator } from 'otplib';
import { OtpRepository } from './repositories/otp.repository';
import { NOTIFICATION_SERVICE } from '../constants/service';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OtpService {
  constructor(
    private readonly otpRepository: OtpRepository,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,
  ) {}
  private generateOtp(): string {
    const secret = process.env.OTP_SECRET;
    if (!secret) {
      throw new Error('OTP_SECRET is not defined in environment variables');
    }
    const otp = authenticator.generate(secret);
    return otp;
  }
  async saveOtp(email: string): Promise<string> {
    const otp: string = this.generateOtp();
    await this.otpRepository.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      verified: false,
      attempts: 0,
    });
    return otp;
  }

  async sendOtp(email: string) {
    const otpCode = await this.saveOtp(email);
    await lastValueFrom(
      this.notificationClient.emit('reset.password', { email, otpCode }),
    );
  }

  async validateOtp(email: string, otp: string) {
    const otpData = await this.otpRepository.findOne({ otp, email });
    if (!otpData) {
      return {
        status: 'failure',
        message: 'OTP validation failed. Invalid or expired code.',
      };
    }
    if (!otpData) throw new Error('Invalid OTP');

    await this.otpRepository.findOneAndDelete({ email, otp });
    return {
      status: 'success',
      message: 'OTP is valid and verified.',
    };
  }
}
