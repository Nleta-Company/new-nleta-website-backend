
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AdminAuthController } from './admin-auth.controller.js';
import { AdminAuthService } from './admin-auth.service.js';
import { AdminAuthGuard } from './admin-auth.guard.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');

        if (!secret || secret.length < 32) {
          throw new Error('JWT_SECRET must be at least 32 characters');
        }

        return {
          secret,
          signOptions: { expiresIn: '8h' },
        };
      },
    }),
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60_000, limit: 100 },
    ]),
  ],
  controllers: [AdminAuthController],
  providers: [
    AdminAuthService,
    AdminAuthGuard,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  exports: [AdminAuthGuard, JwtModule],
})
export class AdminAuthModule {}
