import { registerAs } from '@nestjs/config';

export const logConfigFactory = registerAs('log', () => ({
  diskDestination: process.env.LOG_DIR,
}));
