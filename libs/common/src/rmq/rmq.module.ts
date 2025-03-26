import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RmqService } from './rmq.service';

interface RmqModuleOptions {
  name: string;
}

@Module({
  providers: [RmqService],
  exports: [RmqService],
})
export class RmqModule {
  static register({ name }: RmqModuleOptions): DynamicModule {
    console.log('RmqModule.register', name);
    return {
      module: RmqModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name,
            useFactory: (configService: ConfigService) => {
              const urls = [configService.get<string>('RABBIT_MQ_URI')].filter(
                (url): url is string => !!url,
              );
              const queue = configService.get<string>(
                `RABBIT_MQ_${name}_QUEUE`,
              );
              console.log(
                `Creating queue: ${queue} with URLs: ${urls.join(', ')}`,
              );
              return {
                transport: Transport.RMQ,
                options: {
                  urls,
                  queue,
                },
              };
            },
            inject: [ConfigService],
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
