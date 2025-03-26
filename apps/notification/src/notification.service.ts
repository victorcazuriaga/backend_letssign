import { Injectable, Logger } from '@nestjs/common';
import { EmailAdapter } from './adapters/email.adapter';
import { DiscordAdapter } from './adapters/discord.adapter';
import * as ejs from 'ejs';
import * as path from 'path';
import { INotificationAdapter } from './@types/notification.interface';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private adapters: INotificationAdapter[];

  constructor(
    private readonly emailAdapter: EmailAdapter,
    private readonly discordAdapter: DiscordAdapter,
  ) {
    this.adapters = [emailAdapter, discordAdapter];
  }

  async sendNotification(
    to: string,
    subject: string,
    template: string,
    context: { name: string },
  ) {
    const tasks: Promise<void>[] = [];

    if (process.env.ENABLE_EMAIL_NOTIFICATION === 'true') {
      const message = await this.renderTemplate(template, context);
      tasks.push(this.sendEmailNotification(to, subject, message));
    }
    if (process.env.ENABLE_DISCORD_NOTIFICATION === 'true') {
      tasks.push(this.sendDiscordNotification(to, subject, context));
    }
    await Promise.all(tasks);
  }

  private async renderTemplate(
    template: string,
    context: any,
  ): Promise<string> {
    const templatePath = path.join(
      __dirname,
      'src/templates',
      `${template}.ejs`,
    );
    try {
      return await ejs.renderFile(templatePath, context);
    } catch (error) {
      this.logger.error('Error rendering email template', error);
      throw new Error('Error rendering email template');
    }
  }

  private async sendEmailNotification(
    to: string,
    subject: string,
    message: string,
  ): Promise<void> {
    try {
      await this.emailAdapter.send(to, subject, message);
    } catch (error) {
      this.logger.error('Error sending email', error);
      throw new Error('Error sending email');
    }
  }

  private async sendDiscordNotification(
    to: string,
    subject: string,
    context: { name: string },
  ): Promise<void> {
    const discordChannelId = process.env.DISCORD_CHANNEL_ID;
    if (!discordChannelId) {
      this.logger.error('DISCORD_CHANNEL_ID is not defined');
      throw new Error('DISCORD_CHANNEL_ID is not defined');
    }

    try {
      await this.discordAdapter.send(
        discordChannelId,
        subject,
        `**${to}**\n${context.name}`,
      );
    } catch (error) {
      this.logger.error('Error sending Discord message', error);
      throw new Error('Error sending Discord message');
    }
  }
}
