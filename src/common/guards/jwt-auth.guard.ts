import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JWT_AUTH } from '../common.constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard(JWT_AUTH) {}
