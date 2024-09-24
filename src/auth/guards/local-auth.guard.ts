import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LOCAL_AUTH } from '../auth.constants';

@Injectable()
export class LocalAuthGuard extends AuthGuard(LOCAL_AUTH) {}
