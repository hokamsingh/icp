import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { PrismaModule } from '../prisma';
import { MailModule } from '../mail';
import { SmsModule } from '../sms';

@Module({
  imports: [PrismaModule, SmsModule, MailModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
