import { Inject, UnprocessableEntityException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigType } from '@nestjs/config';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { appConfigFactory, googleConfigFactory } from '@Config';
import { GOOGLE_OAUTH } from '../auth.constants';
import { UsersService } from '../../users';

export class GoogleStrategy extends PassportStrategy(Strategy, GOOGLE_OAUTH) {
  constructor(
    @Inject(appConfigFactory.KEY)
    appConfig: ConfigType<typeof appConfigFactory>,
    @Inject(googleConfigFactory.KEY)
    config: ConfigType<typeof googleConfigFactory>,
    private readonly usersService: UsersService,
  ) {
    super({
      clientID: config.oauth.clientId,
      clientSecret: config.oauth.secret,
      scope: config.oauth.scope,
      callbackURL: `${appConfig.serverUrl}/auth/google/callback`,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { given_name, family_name, email, picture, sub } = profile._json;
    if (!email) {
      done(new UnprocessableEntityException('Profile email not public'));
      return;
    }

    const user = await this.usersService.getOrCreateByGoogle({
      googleId: sub,
      email,
      firstname: given_name,
      lastname: family_name,
      profileImage: picture,
    });

    done(null, user);
  }
}
