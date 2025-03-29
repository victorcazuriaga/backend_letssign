/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Injectable, Logger } from '@nestjs/common';
import { Client, GatewayIntentBits, ChannelType } from 'discord.js';
import { INotificationAdapter } from '../@types/notification.interface';

@Injectable()
export class DiscordAdapter implements INotificationAdapter {
  private readonly logger = new Logger(DiscordAdapter.name);
  private discordClient: Client;

  constructor() {
    this.discordClient = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    });
    this.discordClient.login(process.env.DISCORD_BOT_TOKEN);
  }

  async send(to: string, subject: string, message: string): Promise<void> {
    try {
      const channel = await this.discordClient.channels.fetch(to);
      if (channel?.type === ChannelType.GuildText) {
        await channel.send(message);
        this.logger.log(`Discord message sent to channel ${to}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to send Discord message to channel ${to}`,
        error.stack,
      );
    }
  }
}
// https://discord.com/oauth2/authorize?client_id=1353567102983999529&permissions=68608&integration_type=0&scope=bot+applications.commands
