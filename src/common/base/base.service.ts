import { LoggerService } from '../providers';

export abstract class BaseService {
  protected readonly logger: LoggerService;

  constructor(options?: { loggerDefaultMeta?: any }) {
    this.logger = new LoggerService(options?.loggerDefaultMeta);
  }
}
