import { Job } from 'bullmq';
import { OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { OnWorkerEvent, WorkerHost } from '@nestjs/bullmq';
import { LoggerService } from '../providers';

export abstract class BaseProcessor
  extends WorkerHost
  implements OnModuleInit, OnApplicationShutdown
{
  protected readonly logger: LoggerService;

  constructor(
    private readonly concurrency = 1,
    options?: { loggerDefaultMeta?: any },
  ) {
    super();
    this.logger = new LoggerService(options?.loggerDefaultMeta);
  }

  onModuleInit() {
    this.worker.concurrency = this.concurrency;
  }

  async onApplicationShutdown(): Promise<void> {
    await this.worker.close();
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error): void {
    this.logger.error(err);
  }

  @OnWorkerEvent('error')
  onError(err: Error): void {
    this.logger.error(err);
  }
}
