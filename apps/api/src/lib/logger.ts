import winston from 'winston';
import { isProd } from '../config/env';

export const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  format: isProd
    ? winston.format.json()
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(
          ({ level, message, timestamp }) => `${timestamp} ${level} ${message}`
        )
      ),
  transports: [new winston.transports.Console()],
});
