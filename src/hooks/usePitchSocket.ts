import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config';
import { useAppDispatch } from './useAppDispatch';
import { updateSlotStatus } from '../store/slices/slotsSlice';

export function usePitchSocket(pitchId: string | null, date: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!pitchId || !date) { return; }

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_pitch_room', { pitchId, date });
    });


    socket.on(
      'slot_reserved',
      ({ slotId, expiresAt }: { slotId: string; expiresAt: string }) => {
        dispatch(updateSlotStatus({ slotId, status: 'reserved', expiresAt }));
      },
    );


    socket.on('slot_booked', ({ slotId }: { slotId: string }) => {
      dispatch(updateSlotStatus({ slotId, status: 'booked' }));
    });

    socket.on('slot_released', ({ slotId }: { slotId: string }) => {
      dispatch(updateSlotStatus({ slotId, status: 'available', expiresAt: undefined }));
    });

    return () => {
      socket.emit('leave_pitch_room', { pitchId, date });
      socket.disconnect();
    };
  }, [pitchId, date, dispatch]);

  return socketRef.current;
}
