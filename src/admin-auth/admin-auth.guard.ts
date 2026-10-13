
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

type AdminRequest = Request & {
  admin?: {
    id: string;
    email: string;
    role: string;
  };
};

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AdminRequest>();
    const token = request.cookies?.nleta_admin_token;

    if (!token) {
      throw new UnauthorizedException('Please log in');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      if (
        typeof payload.sub !== 'string' ||
        typeof payload.email !== 'string' ||
        typeof payload.role !== 'string'
      ) {
        throw new UnauthorizedException('Invalid session');
      }

      request.admin = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Session expired or invalid');
    }
  }
}
