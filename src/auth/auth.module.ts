/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { jwtConfigFactory } from '@Config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy, LocalStrategy } from './strategies';
import { AdminModule } from '../admin';
import { UsersModule } from '../users';
import { OtpModule } from '../otp';
import { PrismaService } from 'src/prisma';

@Module({
  imports: [
    AdminModule,
    UsersModule,
    OtpModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigType<typeof jwtConfigFactory>) => ({
        secret: config.secret,
        signOptions: config.signOptions,
      }),
      inject: [jwtConfigFactory.KEY],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, GoogleStrategy, PrismaService],
  exports: [AuthService],
})
export class AuthModule {}
