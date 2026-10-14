
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AdminAuthService } from './admin-auth.service.js';
import { AdminLoginDto } from './dto/admin-login.dto.js';
import { AdminAuthGuard } from './admin-auth.guard.js';

type AdminRequest = Request & {
  admin: {
    id: string;
    email: string;
    role: string;
  };
};

@Controller('admin-auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(
    @Body() dto: AdminLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.adminAuthService.login(dto);

    response.cookie('nleta_admin_token', result.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: 8 * 60 * 60 * 1000,
    });

    return {
      success: true,
      admin: result.admin,
    };
  }

  @Get('me')
  @UseGuards(AdminAuthGuard)
  async me(@Req() request: AdminRequest) {
    return {
      success: true,
      admin: await this.adminAuthService.getProfile(request.admin.id),
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('nleta_admin_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: 8 * 60 * 60 * 1000,
    });

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}
