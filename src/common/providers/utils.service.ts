import os from 'os';
import crypto from 'crypto';
import { customAlphabet } from 'nanoid';
import _ from 'lodash';
import { isAxiosError } from 'axios';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './logger.service';
import { Environment, EnvironmentVariables, UserType } from '../types';

@Injectable()
export class UtilsService {
  private readonly logger = new LoggerService();

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  isProduction(): boolean {
    return this.configService.get('NODE_ENV') === Environment.Production;
  }

  isProductionApp(): boolean {
    if (this.isProduction()) {
      return this.configService.get('APP_ENV') === Environment.Production;
    }
    return false;
  }

  getCookiePrefix(ut: UserType) {
    if (!this.isProduction() || this.isProductionApp()) {
      return `__${ut}__`;
    } else {
      return `${this.configService.get('APP_ENV')}__${ut}__`;
    }
  }

  generateSalt(length = 16): string {
    return crypto.randomBytes(length).toString('hex');
  }

  hashPassword(data: string, salt: string, length: number): string {
    return crypto.scryptSync(data, salt, length).toString('hex');
  }

  generateRandomToken(length?: number): string {
    const alphabet =
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const nanoid = customAlphabet(alphabet);
    return nanoid(length);
  }

  toEnumValue<T extends Record<string, string>>(
    value: string | number,
    type: T,
    capitalize = true,
  ): keyof T {
    if (typeof value === 'string' && capitalize) {
      value = value
        .split('_')
        .map((part) => _.capitalize(part))
        .join('');
    }

    const possibleValues = Object.keys(type as Record<string, string>);
    if (possibleValues.includes(value.toString())) {
      return value as keyof T;
    }
    throw new Error(
      `Unknown enum value '${value}' found, possible values are ${possibleValues.toString()}`,
    );
  }

  exclude<T, Key extends keyof T>(
    obj: T,
    keys: Key[],
    enableClone = false,
  ): Omit<T, Key> {
    if (enableClone) {
      const clone = _.cloneDeep<T>(obj);
      for (const key of keys) {
        delete clone[key];
      }
      return clone;
    } else {
      for (const key of keys) {
        delete obj[key];
      }
      return obj;
    }
  }

  msToDay(ms: number): number {
    return Math.floor(ms / 86400000);
  }

  msToMin(ms: number): number {
    return Math.floor(ms / 60000);
  }

  msToHr(ms: number): number {
    return Math.floor(ms / 3600000);
  }

  msToSec(ms: number): number {
    return Math.floor(ms / 1000);
  }

  msToHuman(
    ms: number,
    options?: {
      maxUnit?: 'day' | 'hour' | 'minute' | 'second';
    },
  ): string {
    options = {
      maxUnit: options?.maxUnit || 'day',
    };

    const dateProperties: Record<string, number> = {};

    if (options.maxUnit === 'day') {
      dateProperties.day = this.msToDay(ms);
      dateProperties.hour = this.msToHr(ms) % 24;
      dateProperties.minute = this.msToMin(ms) % 60;
      dateProperties.second = this.msToSec(ms) % 60;
    }

    if (options.maxUnit === 'hour') {
      dateProperties.hour = this.msToHr(ms);
      dateProperties.minute = this.msToMin(ms) % 60;
      dateProperties.second = this.msToSec(ms) % 60;
    }

    if (options.maxUnit === 'minute') {
      dateProperties.minute = this.msToMin(ms);
      dateProperties.second = this.msToSec(ms) % 60;
    }

    if (options.maxUnit === 'second') {
      dateProperties.second = this.msToSec(ms);
    }

    return Object.entries(dateProperties)
      .filter((val) => val[1] !== 0)
      .map((val) => val[1] + ' ' + (val[1] !== 1 ? val[0] + 's' : val[0]))
      .join(', ');
  }

  async transform<T extends object, V>(
    cls: new (...args: any[]) => T,
    plain: V,
  ): Promise<T> {
    const instance = plainToInstance(cls, plain, {
      enableImplicitConversion: true,
    });
    await validateOrReject(instance, {
      whitelist: true,
      forbidUnknownValues: true,
    });
    return instance;
  }

  async sleep(ms: number) {
    return await new Promise((resolve) => setTimeout(resolve, ms));
  }

  async waitUntilValue<T = any>(
    currentValue: T,
    targetValue: T,
    interval = 1000,
    timeout?: number,
  ): Promise<void> {
    const startTime = Date.now();

    while (currentValue !== targetValue) {
      if (timeout && Date.now() - startTime > timeout) {
        throw new Error(
          `Timeout occurred after ${timeout} ms, while waiting for the "${currentValue}" to reach the target value ${targetValue}`,
          { cause: 'TIMEOUT' },
        );
      }
      await this.sleep(interval);
    }
  }

  async rerunnable<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    backoff: { type: 'fixed' | 'exponential'; delay: number } = {
      type: 'exponential',
      delay: 1000,
    },
    causes?: string[],
  ): Promise<T> {
    let attempt = 0;

    do {
      if (attempt > 0) {
        let delay = backoff.delay;
        if (backoff.type === 'exponential') {
          delay = backoff.delay * Math.pow(2, attempt - 2);
        }
        await this.sleep(delay);
      }

      try {
        return await fn();
      } catch (err) {
        if (
          attempt === maxRetries ||
          (causes && (!err.cause || !causes.includes(err.cause)))
        ) {
          throw err;
        }
        attempt++;
      }
    } while (attempt <= maxRetries);

    throw new Error('Unexpected error occurred');
  }

  async retryable<T>(
    fn: () => Promise<T>,
    options?: {
      backoff?: { type: 'fixed' | 'exponential'; delay: number };
      silent?: boolean;
    },
  ): Promise<T> {
    const backoff = options?.backoff || {
      type: 'fixed',
      delay: 1000,
    };

    let attempt = 0;
    do {
      if (attempt > 0) {
        let delay = backoff.delay;
        if (backoff.type === 'exponential') {
          delay = backoff.delay * Math.pow(2, attempt - 2);
        }
        await this.sleep(delay);
      }

      try {
        return await fn();
      } catch (err) {
        if (!options?.silent) {
          if (isAxiosError(err)) {
            this.logger.error(err.toJSON());
          } else {
            this.logger.error(err);
          }
        }

        attempt++;
      }
    } while (true);
  }

  async occrunnable<T>(fn: () => Promise<T>): Promise<T> {
    do {
      try {
        return await fn();
      } catch (err) {
        if (err.code !== 'P2025') {
          throw err;
        }
      }
    } while (true);
  }

  async batchable<T, R>(
    elements: T[],
    fn: (element: T, index: number) => Promise<R>,
    batchSize = Math.pow(os.cpus().length, 2),
  ): Promise<R[]> {
    const results: R[] = [];
    const processes: Promise<void>[] = [];

    let currentIndex = 0;
    for (let i = 0; i < Math.min(batchSize, elements.length); i++) {
      const process = async () => {
        while (currentIndex < elements.length) {
          const index = currentIndex++;
          const element = elements[index];
          results[index] = await fn(element, index);
        }
      };
      processes.push(process());
    }

    // Wait for all processes to finish
    await Promise.all(processes);

    return results;
  }

  async timeout<T>(
    fn: () => Promise<T>,
    timeout = 20000,
    options?: {
      cleanUp?: () => void;
    },
  ): Promise<T> {
    return await Promise.race<T>([
      fn(),
      new Promise((resolve, reject) => {
        setTimeout(() => {
          if (options?.cleanUp) {
            options.cleanUp();
          }
          reject(
            new Error(`Timeout after ${timeout} ms`, {
              cause: 'TIMEOUT',
            }),
          );
        }, timeout);
      }),
    ]);
  }
}
