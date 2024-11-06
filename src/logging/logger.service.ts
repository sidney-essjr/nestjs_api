import { Injectable, LoggerService } from '@nestjs/common';
import { join } from 'path';
import winston, { createLogger, format, transports } from 'winston';
import { ILogger } from './logger.interface';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { existsSync, mkdirSync } from 'fs';
import { File } from 'winston/lib/winston/transports';

@Injectable()
export class Logger implements LoggerService, ILogger {
  private logger: winston.Logger;

  constructor() {
    const logDir = join(__dirname, '..', '..', 'logs');

    if (!existsSync(logDir)) {
      mkdirSync(logDir);
    }

    this.logger = createLogger({
      level: 'error',
      format: format.combine(format.timestamp(), format.json()),
      transports: [
        new transports.Console({
          format: format.combine(format.colorize(), format.simple()),
        }),
        new DailyRotateFile({
          filename: join(logDir, 'application-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d', // Mantem logs dos ultimos 30 dias
        }),
      ],
      exceptionHandlers: [
        new File({
          filename: join(logDir, 'exceptions.log'),
        }),
      ],
      rejectionHandlers: [
        new File({
          filename: join(logDir, 'rejections.log'),
        }),
      ],
    });
  }

  log(message: string, meta?: object): void {
    this.logger.info(message, meta);
  }
  error(message: string, meta?: object): void {
    this.logger.error(message, meta);
  }
  warn(message: string, meta?: object): void {
    this.logger.warn(message, meta);
  }
  debug?(message: string, meta?: object): void {
    this.logger.debug(message, meta);
  }
}
