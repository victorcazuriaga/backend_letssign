/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './repositories/users.repository';
import { CreateUserRequest } from './dtos/create-user.request';
import { User } from './schemas/user.schema';
import { CompanyRepository } from './repositories/company.repository';
import { UpdateUserRequest } from './dtos/update-user.request';
import { GetUserResponse } from './dtos/get-user.response';
import { CreateCompanyRequest } from './dtos/create-company.request';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly companyRepository: CompanyRepository,
  ) {}

  async createUser(request: CreateUserRequest) {
    await this.validateCreateUserRequest(request);

    const user = await this.usersRepository.create({
      ...request,
      password: await bcrypt.hash(request.password, 10),
      role: request.role || 'member',
      status: request.status || 'pending',
    });

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
    const user = await this.usersRepository.findOne({ _id: userId });
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
      { _id: userId },
      populateOptions,
    );
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

  async updateUser(userId, request: UpdateUserRequest) {
    const user = await this.usersRepository.findOneAndUpdate(userId, request);
    return user;
  }
}
