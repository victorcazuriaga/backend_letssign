import { Resend } from 'resend';
import { Logger } from '@nestjs/common';
import { INotificationAdapter } from '../@types/notification.interface';

export class EmailAdapter implements INotificationAdapter {
  private logger = new Logger(EmailAdapter.name);
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async send(to: string, subject: string, message: string): Promise<void> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: process.env.SENDGRID_FROM_EMAIL || 'default@example.com',
        to: [to],
        subject: subject,
        html: message,
      });

      if (error) {
        this.logger.error('Error sending email:', error);
        throw new Error('Failed to send email');
      }

      this.logger.log('Email sent successfully:', data);
    } catch (error) {
      this.logger.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}
