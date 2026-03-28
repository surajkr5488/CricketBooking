import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server;

export function initializeSocket(httpServer: HttpServer): void {
  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`  [Socket] connected  : ${socket.id}`);

    // Client joins room for a specific pitch + date
    socket.on('join_pitch_room', ({ pitchId, date }: { pitchId: string; date: string }) => {
      const room = `pitch:${pitchId}:${date}`;
      socket.join(room);
      console.log(`  [Socket] joined room : ${room}`);
    });

    socket.on('leave_pitch_room', ({ pitchId, date }: { pitchId: string; date: string }) => {
      socket.leave(`pitch:${pitchId}:${date}`);
    });

    socket.on('disconnect', () => {
      console.log(`  [Socket] disconnected: ${socket.id}`);
    });
  });
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}
