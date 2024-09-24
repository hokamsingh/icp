import 'dotenv/config';
import path from 'path';
import { Logger, createLogger, transports, format } from 'winston';
import { Environment } from '../types';

const { Console, File } = transports;
const LogLevel = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
} as const;
type LogLevel = keyof typeof LogLevel;

export class LoggerService {
  private readonly logger: Logger;
  private readonly isProduction: boolean;
  private readonly logDir: string;

  constructor(defaultMeta?: any) {
    this.isProduction = process.env.NODE_ENV === Environment.Production;
    this.logDir = path.join(process.env.LOG_DIR || 'logs');

    this.logger = createLogger({
      levels: LogLevel,
      level: process.env.LOG_LEVEL,
      defaultMeta,
      format: this.getFormat(),
      transports: this.getTransports(),
    });
  }

  private getTransports() {
    if (this.isProduction) {
      const options = {
        dirname: this.logDir,
      };
      return [
        new File({
          ...options,
          level: process.env.LOG_LEVEL,
          filename: 'app.log',
        }),
        new File({
          ...options,
          level: 'error',
          filename: 'error.log',
        }),
      ];
    } else {
      return new Console({
        level: process.env.LOG_LEVEL,
        format: format.colorize({ all: true }),
      });
    }
  }

  private getFormat() {
    return format.combine(
      format.timestamp(),
      format.splat(),
      format.errors({ stack: true }),
      format.json(),
    );
  }

  setDefaultMeta(meta?: any) {
    this.logger.defaultMeta = meta;
  }

  child(meta?: any) {
    return new LoggerService({
      ...(this.logger.defaultMeta || {}),
      ...(meta || {}),
    });
  }

  log(level: LogLevel, message: any, ...args: any[]) {
    this.logger.log(level, message, ...args);
  }

  info(message: any, ...args: any[]) {
    this.log('info', message, ...args);
  }

  error(message: any, ...args: any[]) {
    this.log('error', message, ...args);
  }

  warn(message: any, ...args: any[]) {
    this.log('warn', message, ...args);
  }

  debug(message: any, ...args: any[]) {
    this.log('debug', message, ...args);
  }
}
