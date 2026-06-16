import winston from 'winston';
import { env } from '../config/env';

const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const extras = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
    return `${String(timestamp)} ${level}: ${String(message)}${extras}`;
  }),
);

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    env.NODE_ENV === 'production' ? winston.format.json() : devFormat,
  ),
  transports: [new winston.transports.Console()],
});
