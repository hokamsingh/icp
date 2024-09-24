import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsService {
  constructor() {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async send(mobile: string, text: string): Promise<void> {}
}
