import winston from 'winston';
import { env } from '../config/env';

// Error instances passed in metadata (e.g. { err }) serialize to "{}" under
// JSON.stringify because their fields are non-enumerable. Expand them into plain
// objects so production logs keep the message and stack.
const expandErrors = winston.format((info) => {
  for (const [key, value] of Object.entries(info)) {
    if (value instanceof Error) {
      info[key] = { message: value.message, name: value.name, stack: value.stack };
    }
  }
  return info;
});

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
    expandErrors(),
    env.NODE_ENV === 'production' ? winston.format.json() : devFormat,
  ),
  transports: [new winston.transports.Console()],
});
