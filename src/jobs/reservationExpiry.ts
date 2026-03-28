import cron from 'node-cron';
import { getRedis } from '../config/redis';
import { getIO } from '../socket/socket';


export function startExpiryJob(): void {
  cron.schedule('*/30 * * * * *', async () => {
    try {
      const redis = getRedis();
      let cursor = '0';

      do {
        const [next, keys] = await redis.scan(
          cursor, 'MATCH', 'reservation:*', 'COUNT', 100
        );
        cursor = next;

        for (const key of keys) {
          const ttl = await redis.ttl(key);
          if (ttl === -2) {

            const parts = key.split(':');
            const slotId = parts[1];
            const date = parts[2];
            const pitchId = slotId.split('_')[0];

            getIO()
              .to(`pitch:${pitchId}:${date}`)
              .emit('slot_released', { slotId });
          }
        }
      } while (cursor !== '0');
    } catch (err) {
      console.error('[ExpiryJob]', err);
    }
  });
}
