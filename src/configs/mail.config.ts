import { registerAs } from '@nestjs/config';

export const mailConfigFactory = registerAs('mail', () => ({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  sender: process.env.SMTP_SENDER,
}));
