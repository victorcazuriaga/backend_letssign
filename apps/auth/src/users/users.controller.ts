import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  Get,
  Patch,
} from '@nestjs/common';
import { CreateUserRequest } from './dtos/create-user.request';
import { UsersService } from './users.service';
import { UpdateUserRequest } from './dtos/update-user.request';
import JwtAuthGuard from '../guards/jwt-auth.guard';
import { GetUserResponse } from './dtos/get-user.response';
import { CreateCompanyRequest } from './dtos/create-company.request';

@Controller('auth/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() request: CreateUserRequest): Promise<any> {
    return await this.usersService.createUser(request);
  }
  @UseGuards(JwtAuthGuard)
  @Post('company')
  async createCompany(
    @Req() req: { user: { _id: string } },
    @Body() request: CreateCompanyRequest,
  ): Promise<any> {
    const userId: string = req.user._id;
    return this.usersService.createCompany(request, userId);
  }
  @UseGuards(JwtAuthGuard)
  @Patch()
  async updateUser(
    @Req() req: { user: { _id: string } },
    @Body() request: UpdateUserRequest,
  ): Promise<any> {
    const userId: string = req.user._id;
    return this.usersService.updateUser(userId, request);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getProfile(
    @Req() req: { user: { _id: string } },
  ): Promise<Partial<GetUserResponse>> {
    const userId: string = req.user._id;
    return await this.usersService.getProfile(userId);
  }

  @Post('validate')
  async validateUser(@Body() request: CreateUserRequest): Promise<any> {
    return this.usersService.validateUser(request.email, request.password);
  }
}
