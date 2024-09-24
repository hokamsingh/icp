import { registerAs } from '@nestjs/config';

export const authConfigFactory = registerAs('auth', () => ({
  authCookieExpirationTime: () => new Date(Date.now() + 86400000), // 24 hr - Should be equal to access token expiry time
}));
