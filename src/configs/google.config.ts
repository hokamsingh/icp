import { registerAs } from '@nestjs/config';

export const googleConfigFactory = registerAs('google', () => ({
  oauth: {
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
    secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    scope: ['email', 'profile'],
  },
}));
