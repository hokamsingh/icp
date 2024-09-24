import path from 'path';
import pug from 'pug';
import nodemailer from 'nodemailer';
import { Queue } from 'bullmq';
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import {
  appConfigFactory,
  mailConfigFactory,
  mailQueueConfigFactory,
} from '@Config';
import { MAIL_QUEUE } from './mail.constants';
import { MailTemplate } from './mail.types';

export type SendMessagePayload = {
  to: string;
  subject: string;
  mailBodyOrTemplate: string | MailTemplate;
  attachments?: string[];
  replyTo?: string;
};

@Injectable()
export class MailService {
  transporter;

  constructor(
    @Inject(mailConfigFactory.KEY)
    private readonly config: ConfigType<typeof mailConfigFactory>,
    @Inject(appConfigFactory.KEY)
    private readonly appConfig: ConfigType<typeof appConfigFactory>,
    @Inject(mailQueueConfigFactory.KEY)
    private readonly queueConfig: ConfigType<typeof mailQueueConfigFactory>,
    @InjectQueue(MAIL_QUEUE)
    private readonly mailQueue: Queue<SendMessagePayload, SentMessageInfo>,
  ) {
    this.transporter = nodemailer.createTransport({
      name: this.appConfig.domain,
      host: this.config.host,
      port: this.config.port,
      auth: {
        user: this.config.auth.user,
        pass: this.config.auth.pass,
      },
    });
  }

  configureMessage = (
    to: string,
    subject: string,
    mailBody: string,
    attachments?: string[],
    replyTo?: string,
  ) => {
    const messageConfiguration: Record<string, unknown> = {
      from: this.config.sender,
      to,
      subject,
      html: mailBody,
      attachments: attachments ? attachments : [],
    };

    if (replyTo) {
      messageConfiguration.replyTo = replyTo;
    }

    return messageConfiguration;
  };

  async renderTemplate(template: MailTemplate) {
    return await pug.renderFile(
      path.resolve('templates', 'mail', `${template.name}.pug`),
      'data' in template ? template.data : {},
    );
  }

  async send(mailPayload: SendMessagePayload): Promise<void> {
    await this.mailQueue.add('send', mailPayload, this.queueConfig.options);
  }
}
