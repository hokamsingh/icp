import { registerAs } from '@nestjs/config';

export const adminConfigFactory = registerAs('admin', () => ({
  passwordSaltLength: 16,
  passwordHashLength: 32,
  profileImagePath: 'admin/profile',
}));
