import winston from 'winston';
import { trace } from '@opentelemetry/api';

const otelCorrelation = winston.format((info) => {
  const span = trace.getActiveSpan();
  if (span) {
    const ctx = span.spanContext();
    info.traceId = ctx.traceId;
    info.spanId  = ctx.spanId;
  }
  return info;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    otelCorrelation(),
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.simple(),
  ),
  defaultMeta: { service: 'ai-notes-backend' },
  transports: [new winston.transports.Console()],
});

export default logger;