/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  Inject,
  UnauthorizedException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './repositories/users.repository';
import { CreateUserRequest } from './dtos/create-user.request';
import { User } from './schemas/user.schema';
import { CompanyRepository } from './repositories/company.repository';
import { UpdateUserRequest } from './dtos/update-user.request';
import { GetUserResponse } from './dtos/get-user.response';
import { CreateCompanyRequest } from './dtos/create-company.request';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { NOTIFICATION_SERVICE, OTP_SERVICE } from './constants/service';
import { Types } from 'mongoose';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly companyRepository: CompanyRepository,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,
    @Inject(OTP_SERVICE)
    private readonly otpClient: ClientProxy,
  ) {}

  private generateLink(id: string): string {
    const baseUrl = 'https://yourwebsite.com/welcome';
    const link = `${baseUrl}?userId=${id}`;
    return link;
  }

  async createUser(request: CreateUserRequest) {
    await this.validateCreateUserRequest(request);

    const user = await this.usersRepository.create({
      ...request,
      password: await bcrypt.hash(request.password, 10),
      role: request.role || 'member',
      status: request.status || 'pending',
    });
    const url: string = this.generateLink(user._id.toString());

    await lastValueFrom(
      this.notificationClient.emit('user.created', {
        email: user.email,
        name: user.name,
        url,
      }),
    );

    Reflect.deleteProperty(user, 'password');
    return user;
  }

  async createCompany(request: CreateCompanyRequest, userId: string) {
    const existingCompany = await this.companyRepository.findOne({
      cnpj: request.cnpj,
    });
    if (existingCompany) {
      throw new UnprocessableEntityException('CNPJ already exists.');
    }
    const user = await this.usersRepository.findOne({
      _id: new Types.ObjectId(userId),
    });
    if (!user) {
      throw new UnprocessableEntityException('User not found.');
    }
    const company = await this.companyRepository.create({
      companyName: request.companyName || '',
      cnpj: request.cnpj || '',
      users: [user._id],
    });
    await this.usersRepository.findOneAndUpdate(user._id, {
      company: company._id,
      role: 'root',
    });
    return company;
  }

  private async validateCreateUserRequest(request: CreateUserRequest) {
    let existingUser: User | null = null;
    try {
      existingUser = await this.usersRepository.findOne({
        $or: [{ email: request.email }, { cpf: request.cpf }],
      });
    } catch (err) {
      console.error('Error finding user:', err);
    }
    if (existingUser?.email === request.email) {
      throw new UnprocessableEntityException('Email already exists.');
    } else if (existingUser?.cpf === request.cpf) {
      throw new UnprocessableEntityException('CPF already exists.');
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findOneIncludingPassword({ email });
    if (!user) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
    return user;
  }

  async getUser(getUserArgs: Partial<User>) {
    const user = await this.usersRepository.findOne(getUserArgs);
    return user;
  }

  async getProfile(userId: string): Promise<Partial<GetUserResponse>> {
    const populateOptions = { path: 'company' };
    const user: any = await this.usersRepository.findOne(
      { _id: new Types.ObjectId(userId) },
      populateOptions,
    );
    if (user.status !== 'active') {
      throw new UnprocessableEntityException(
        'User not confirmed or User suspend.',
      );
    }
    const userProfile: GetUserResponse = {
      _id: user._id.toString(),
      email: user.email,
      type: user.type,
      name: user.name,
      companyName: user.company || undefined,
      lastName: user.lastName || '',
      role: user.role,
      status: user.status as 'active' | 'pending' | 'suspended',
    };

    return userProfile;
  }
  async updateUser(userId: string, request: UpdateUserRequest) {
    const user = await this.usersRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(userId) },
      request,
    );
    return user;
  }

  async resetPassword(email: string) {
    const findEmailUser = await this.usersRepository.findOne({ email });
    if (findEmailUser) {
      await lastValueFrom(
        this.otpClient.emit('otp.request', {
          email: findEmailUser.email,
          eventName: 'reset.password',
        }),
      );
    }
    this.logger.log(findEmailUser);
    return { status: 'success', message: 'Email sent successfully.' };
  }
  async confirmEmail(userId: string) {
    const user = await this.usersRepository.findOne({
      _id: new Types.ObjectId(userId),
    });
    if (!user) {
      throw new UnprocessableEntityException('User not found.');
    }
    await this.usersRepository.findOneAndUpdate(user._id, { status: 'active' });
    return { status: 'success', message: 'Email confirmed successfully.' };
  }
  async confirmResetPassword(email: string, newPassword: string, otp: string) {
    const checkOtp: { status: string; message: string } = await lastValueFrom(
      this.otpClient.send('otp.validate', {
        email,
        otp,
      }),
    );
    if (checkOtp.status === 'success') {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.usersRepository.findOneAndUpdate(
        { email },
        { password: hashedPassword },
      );
      return { status: 'success', message: 'Password reset successfully.' };
    }
    return { status: 'error', message: 'Request new otp' };
  }
}
