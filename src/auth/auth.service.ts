import { UserMeta } from '@prisma/client';
/* eslint-disable prettier/prettier */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { OtpTransport, User } from '@prisma/client';
import { JwtPayload, UserType } from '@Common';
import { LoginRequestDto, SendCodeRequestType } from './dto';
import { UsersService } from '../users';
import {
  OtpContext,
  OtpService,
  SendCodeResponse,
  VerifyCodeResponse,
} from '../otp';
import { PrismaService } from 'src/prisma';

export type ValidAuthResponse = {
  accessToken: string;
  type: UserType;
};

export type InvalidVerifyCodeResponse = {
  email: VerifyCodeResponse;
  mobile?: VerifyCodeResponse;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly otpService: OtpService,
  ) {}

  private generateJwt(payload: JwtPayload, options?: JwtSignOptions): string {
    return this.jwtService.sign(payload, options);
  }

  async sendCode(
    target: string,
    transport: OtpTransport,
    type: SendCodeRequestType,
  ): Promise<SendCodeResponse> {
    if (type === SendCodeRequestType.Register) {
      if (
        transport === OtpTransport.Email &&
        (await this.usersService.isEmailExist(target))
      ) {
        throw new Error('Email already in use');
      }
      if (
        transport === OtpTransport.Mobile &&
        (await this.usersService.isMobileExist(target))
      ) {
        throw new Error('Mobile already in use');
      }

      return await this.otpService.send({
        context: OtpContext.Register,
        target,
        ...(transport === OtpTransport.Email
          ? {
              transport,
              transportParams: {
                username: 'User',
              },
            }
          : { transport }),
      });
    }

    throw new Error('Unknown send code request type found');
  }

  async login(userId: number, type: UserType): Promise<ValidAuthResponse> {
    const payload = { sub: userId, type: type };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      type,
    };
  }

  async registerUser(data: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    dialCode?: string;
    mobile?: string;
    country?: string;
    emailVerificationCode?: string;
    mobileVerificationCode?: string;
  }): Promise<InvalidVerifyCodeResponse | ValidAuthResponse> {
    const user = await this.usersService.create({
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      password: data.password,
      dialCode: data.dialCode,
      mobile: data.mobile,
      country: data.country,
    });
    return {
      accessToken: this.generateJwt({
        sub: user.id,
        type: UserType.User,
      }),
      type: UserType.User,
    };
  }

  async forgotPassword(
    email?: string,
    mobile?: string,
  ): Promise<{ email?: SendCodeResponse; mobile?: SendCodeResponse }> {
    return await this.usersService.sendResetPasswordVerificationCode(
      email,
      mobile,
    );
  }

  async getUser(userId: number) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
        },
      });
      return user;
    } catch (error) {
      throw new Error('User not found');
    }
  }

  async resetPassword(
    code: string,
    newPassword: string,
    mobile?: string,
    email?: string,
  ): Promise<User> {
    return await this.usersService.resetPassword(
      code,
      newPassword,
      mobile,
      email,
    );
  }
}
