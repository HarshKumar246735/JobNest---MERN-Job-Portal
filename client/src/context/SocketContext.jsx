import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const C = createContext({ unread: 0, refreshUnread: () => {} });

export const useUnread = () => useContext(C);

export function SocketProvider({ children }) {
const { user } = useAuth();
const toast = useToast();
const [unread, setUnread] = useState(0);

const refreshUnread = useCallback(() => {
if (!user) {
setUnread(0);
return;
}


api.get('/notifications')
  .then((response) => setUnread(response.data.unread))
  .catch(() => {});


}, [user]);

useEffect(() => {
if (!user) {
setUnread(0);
return;
}


refreshUnread();

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const socketUrl = apiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');

const socket = io(socketUrl, {
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('JobNest Socket.IO connected:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('JobNest Socket.IO connection error:', error.message);
});

socket.on('notification', (notification) => {
  setUnread((count) => count + 1);

  toast(
    notification.title +
      (notification.message ? `: ${notification.message}` : '')
  );
});

return () => {
  socket.removeAllListeners();
  socket.disconnect();
};


}, [user, refreshUnread, toast]);

return (
<C.Provider value={{ unread, refreshUnread }}>
{children}
</C.Provider>
);
}
