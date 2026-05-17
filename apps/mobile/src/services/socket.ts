import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL, getApiToken } from './api';

export interface LivePeer {
  userId: string;
  name: string;
  nucleoType: string | null;
  lat: number;
  lng: number;
  updatedAt: number;
}

let socket: Socket | null = null;

function ensure(): Socket {
  if (!socket) {
    socket = io(API_BASE_URL, {
      transports: ['websocket'],
      auth: { token: getApiToken() },
    });
  } else if (!socket.connected) {
    socket.auth = { token: getApiToken() };
    socket.connect();
  }
  return socket;
}

type Unsub = () => void;
function on<T>(event: string, cb: (payload: T) => void): Unsub {
  const s = ensure();
  s.on(event, cb as (...args: unknown[]) => void);
  return () => s.off(event, cb as (...args: unknown[]) => void);
}

export const liveMap = {
  join: (eventId: string) => ensure().emit('map:join', { eventId }),
  sendLocation: (eventId: string, lat: number, lng: number) =>
    socket?.emit('map:location', { eventId, lat, lng }),
  setGhost: (eventId: string, enabled: boolean) =>
    socket?.emit('map:ghost', { eventId, enabled }),
  leave: (eventId: string) => socket?.emit('map:leave', { eventId }),

  onSnapshot: (cb: (p: { eventId: string; peers: LivePeer[] }) => void) =>
    on('map:snapshot', cb),
  onPeer: (cb: (p: LivePeer) => void) => on('map:peer', cb),
  onPeerLeft: (cb: (p: { userId: string }) => void) => on('map:peer-left', cb),
  onError: (cb: (p: { message: string }) => void) => on('map:error', cb),

  disconnect: () => {
    socket?.disconnect();
    socket = null;
  },
};
