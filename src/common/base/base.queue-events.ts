import { OnQueueEvent, QueueEventsHost } from '@nestjs/bullmq';
import { LoggerService } from '../providers';

export abstract class BaseQueueEvents extends QueueEventsHost {
  protected readonly logger: LoggerService;

  constructor(options?: { loggerDefaultMeta?: any }) {
    super();
    this.logger = new LoggerService(options?.loggerDefaultMeta);
  }

  @OnQueueEvent('error')
  onError(err: Error): void {
    this.logger.error(err);
  }
}
