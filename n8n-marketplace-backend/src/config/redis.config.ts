import { registerAs } from '@nestjs/config';

// Redis is only used for the BullMQ job queue (bulk workflow upload).
// Set REDIS_ENABLED=false to run without Redis — bulk uploads then execute
// synchronously in-process instead of being queued.
export const isRedisEnabled = (): boolean =>
  process.env.REDIS_ENABLED !== 'false';

export default registerAs('redis', () => ({
  enabled: isRedisEnabled(),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
}));
