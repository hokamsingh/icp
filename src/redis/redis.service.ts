import { Redis } from 'ioredis';
import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@Common';

@Injectable()
export class RedisService implements OnModuleInit, OnApplicationShutdown {
  client: Redis;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  async onModuleInit() {
    this.client = new Redis(this.configService.get('REDIS_URI'), {
      lazyConnect: true,
    });

    this.client.on('error', (err: Error) => {
      throw err;
    });

    await this.client.connect();
  }

  async onApplicationShutdown() {
    if (this.client) {
      await this.client.quit();
    }
  }
}
