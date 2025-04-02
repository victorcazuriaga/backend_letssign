import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtCookieAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromCookie(request);

    if (!token) {
      throw new UnauthorizedException('JWT token not found in cookies');
    }

    try {
      const payload = this.jwtService.verify<{ userId: string }>(token);
      if (!payload || !payload.userId) {
        throw new UnauthorizedException('Invalid JWT payload');
      }
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired JWT token');
    }
  }

  private extractTokenFromCookie(request: Request): string | null {
    const cookies = request.cookies as Record<string, string> | undefined;
    return cookies?.Authentication || null;
  }
}
