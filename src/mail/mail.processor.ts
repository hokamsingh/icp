import { Job } from 'bullmq';
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport';
import { Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Processor } from '@nestjs/bullmq';
import { BaseProcessor } from '@Common';
import { mailQueueConfigFactory } from '@Config';
import { MAIL_QUEUE } from './mail.constants';
import { MailService, SendMessagePayload } from './mail.service';

@Processor(MAIL_QUEUE)
export class MailProcessor extends BaseProcessor {
  constructor(
    @Inject(mailQueueConfigFactory.KEY)
    readonly config: ConfigType<typeof mailQueueConfigFactory>,
    private readonly mailService: MailService,
  ) {
    super(config.concurrency, {
      loggerDefaultMeta: { processor: MailProcessor.name },
    });
  }

  async process(
    job: Job<SendMessagePayload, SentMessageInfo, string>,
  ): Promise<SentMessageInfo> {
    const { to, subject, attachments, replyTo } = job.data;
    let { mailBodyOrTemplate } = job.data;

    if (typeof mailBodyOrTemplate !== 'string') {
      mailBodyOrTemplate =
        await this.mailService.renderTemplate(mailBodyOrTemplate);
    }

    const mailOptions = this.mailService.configureMessage(
      to,
      subject,
      mailBodyOrTemplate,
      attachments,
      replyTo,
    );
    return await this.mailService.transporter.sendMail(mailOptions);
  }
}
