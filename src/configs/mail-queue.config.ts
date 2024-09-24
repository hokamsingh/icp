import { registerAs } from '@nestjs/config';

export const mailQueueConfigFactory = registerAs('mailQueue', () => ({
  concurrency: 5,
  options: {
    removeOnComplete: true,
    removeOnFail: {
      age: 24 * 60 * 60, // 24 hr in seconds
    },
  },
}));
