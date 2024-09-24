import { registerAs } from '@nestjs/config';
import { Environment } from '@Common';

export const appConfigFactory = registerAs('app', () => ({
  env: process.env.APP_ENV as Environment,
  domain: process.env.DOMAIN,
  appWebUrl: process.env.APP_WEB_URL,
  adminWebUrl: process.env.ADMIN_WEB_URL,
  serverUrl: process.env.SERVER_URL,
  appUri: process.env.APP_URI,
  httpPayloadMaxSize: '20mb',
  platformName: process.env.PLATFORM_NAME,
}));
