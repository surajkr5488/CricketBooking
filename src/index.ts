import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';

import { initializeSocket } from './socket/socket';
import { initializeRedis } from './config/redis';
import { startExpiryJob } from './jobs/reservationExpiry';

import authRoutes    from './routes/auth.routes';
import pitchRoutes   from './routes/pitch.routes';
import slotRoutes    from './routes/slot.routes';
import bookingRoutes from './routes/booking.routes';
import { errorHandler } from './middlewares/errorHandler';

const app        = express();
const httpServer = createServer(app);

// ── Middleware ────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/pitches', pitchRoutes);
app.use('/api/slots',   slotRoutes);
app.use('/api',         bookingRoutes);

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date() })
);

// ── Error handler ─────────────────────────────────────────────────
app.use(errorHandler);

// ── Boot ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

async function bootstrap() {
  await initializeRedis();
  initializeSocket(httpServer);
  startExpiryJob();

  httpServer.listen(PORT, () => {
    console.log(`\n🚀  Server      → http://localhost:${PORT}`);
    console.log(`📡  Socket.io   → ready`);
    console.log(`🗄️   Prisma      → PostgreSQL connected`);
    console.log(`⚡  Redis       → connected`);
    console.log(`⏱️   Expiry job  → running every 30s\n`);
  });
}

bootstrap().catch(console.error);
