/* eslint-disable prettier/prettier */
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { ValidatedUser } from '@Common';
import { LOCAL_AUTH } from '../auth.constants';
import { UsersService } from '../../users';
import { AdminService } from '../../admin';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, LOCAL_AUTH) {
  constructor(
    private readonly usersService: UsersService,
    private readonly adminService: AdminService,
  ) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<ValidatedUser> {
    // console.log('validate' , email , password)
    let user: false | ValidatedUser | null;
    user = await this.usersService.validateCredentials(email, password);
    // console.log('user' , user)
    if (user === null) {
      user = await this.adminService.validateCredentials(email, password);
    }
    if (user) return user;
    if (user === false) throw new UnauthorizedException('Incorrect password');

    throw new UnauthorizedException('User does not exist');
  }
}
