import { registerAs } from '@nestjs/config';

export const otpConfigFactory = registerAs('otp', () => ({
  default: '000000',
  length: 6,
  maxAttempt: 10,
  maxRetries: 5,
  timeout: 120000, // 2 min
  blockTimeout: 86400000, // 24 hr
}));
