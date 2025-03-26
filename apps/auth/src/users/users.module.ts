import { Module } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { CompanyRepository } from './repositories/company.repository';
import { CompanySchema } from './schemas/company.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: 'Company', schema: CompanySchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, CompanyRepository],
  exports: [UsersService],
})
export class UsersModule {}
