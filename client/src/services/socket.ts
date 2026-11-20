import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socketInstance) {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      // console.log('[Socket] Connected with ID:', socketInstance?.id);
    });

    socketInstance.on('connect_error', (err) => {
      // console.warn('[Socket] Connection error:', err.message);
    });
  }
  return socketInstance;
};
