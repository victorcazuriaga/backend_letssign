import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import JwtAuthGuard from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { User } from './users/schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.authService.login(user, response);
    response.sendStatus(200);
  }
  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    this.authService.logout(response);
    response.sendStatus(200);
  }

  @UseGuards(JwtAuthGuard)
  @MessagePattern('validate_user')
  validateUser(@CurrentUser() user: User) {
    return user;
  }
}
