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
import { GetUserResponse } from './dtos/get-user.response';
import { CreateCompanyRequest } from './dtos/create-company.request';
import { JwtCookieAuthGuard } from '../guards/jwt-cookie-auth.guard';
import { SentryExceptionCaptured } from '@sentry/nestjs';

@Controller('auth/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() request: CreateUserRequest): Promise<any> {
    return await this.usersService.createUser(request);
  }
  @UseGuards(JwtCookieAuthGuard)
  @Post('company')
  async createCompany(
    @Req() req: { user: { userId: string } },
    @Body() request: CreateCompanyRequest,
  ): Promise<any> {
    const userId: string = req.user.userId;
    return this.usersService.createCompany(request, userId);
  }
  @UseGuards(JwtCookieAuthGuard)
  @Patch()
  async updateUser(
    @Req() req: { user: { userId: string } },
    @Body() request: UpdateUserRequest,
  ): Promise<any> {
    const userId: string = req.user.userId;
    return this.usersService.updateUser(userId, request);
  }

  @UseGuards(JwtCookieAuthGuard)
  @Get()
  async getProfile(
    @Req() req: { user: { userId: string } },
  ): Promise<Partial<GetUserResponse>> {
    const userId: string = req.user.userId;
    return await this.usersService.getProfile(userId);
  }
  @Post('reset-password')
  async requestPasswordReset(@Body() request: { email: string }): Promise<any> {
    return this.usersService.resetPassword(request.email);
  }
  @Post('confirm-reset-password')
  async confirmPasswordReset(
    @Body() request: { email: string; newPassword: string; otp: string },
  ): Promise<any> {
    return this.usersService.confirmResetPassword(
      request.email,
      request.newPassword,
      request.otp,
    );
  }

  @Post('confirm-email')
  async confirmEmail(@Body() request: { userId: string }): Promise<any> {
    return this.usersService.confirmEmail(request.userId);
  }

  @Post('validate')
  async validateUser(@Body() request: CreateUserRequest): Promise<any> {
    return this.usersService.validateUser(request.email, request.password);
  }

  // #TODO: Remove this endpoint in production
  @Get('debug-sentry')
  @SentryExceptionCaptured()
  getError() {
    const error = new Error('My first Sentry error!');
    throw error;
  }
}
