import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { tokenStore } from '../utils/tokenStore';
import { toast } from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    const token = tokenStore.get();
    if (!token) return;

    // OLD: import.meta.env.VITE_API_URL?.replace(/\/api$/, '') — stripped the old /api suffix
    // VITE_API_URL now ends in /api/v1 so we strip /api/v1 instead.
    // VITE_SOCKET_URL is the more explicit alternative and avoids this stripping entirely.
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_URL?.replace(/\/api\/v1$/, "") ||
      "http://localhost:3000";
    const s = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      // Pass token at handshake time — handled by io.use() middleware on the backend
      auth: { token },
    });

    s.on('new_notification', (data: { type: string; title: string; message: string }) => {
      if (data.type === 'message') {
        toast.success(data.title, {
          duration: 4000,
          icon: '💬',
        });
      }
    });

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
