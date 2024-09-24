import { registerAs } from '@nestjs/config';

export const jwtConfigFactory = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: '24h' },
}));
