import { Module } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { CompanyRepository } from './repositories/company.repository';
import { CompanySchema } from './schemas/company.schema';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule, RmqModule } from '@app/common';
import { NOTIFICATION_SERVICE, OTP_SERVICE } from './constants/service';
@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: 'Company', schema: CompanySchema },
    ]),
    RmqModule.register({ name: NOTIFICATION_SERVICE }),
    RmqModule.register({ name: OTP_SERVICE }),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, CompanyRepository],
  exports: [UsersService],
})
export class UsersModule {}
