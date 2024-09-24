import { registerAs } from '@nestjs/config';

export const userConfigFactory = registerAs('user', () => ({
  passwordSaltLength: 16,
  passwordHashLength: 32,
  profileImagePath: 'user/profile',
}));
