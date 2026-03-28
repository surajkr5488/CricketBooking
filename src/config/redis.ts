import Redis from 'ioredis';

let redisClient: Redis;

export async function initializeRedis(): Promise<void> {
  redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    retryStrategy: times => Math.min(times * 50, 2000),
    lazyConnect: true,
  });

  redisClient.on('connect', () => console.log('  ✅ Redis connected'));
  redisClient.on('error',   err  => console.error('  ❌ Redis error:', err.message));

  await redisClient.connect();
}

export function getRedis(): Redis {
  if (!redisClient) throw new Error('Redis not initialized');
  return redisClient;
}

// ── Key helpers ───────────────────────────────────────────────────
export const RESERVATION_KEY = (slotId: string, date: string) =>
  `reservation:${slotId}:${date}`;
