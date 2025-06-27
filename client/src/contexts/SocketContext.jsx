import { createContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { isAuthenticated, user } = useAuth();


  useEffect(() => {
    let socketInstance = null;

    if (isAuthenticated && user) {

      const token = localStorage.getItem('token');
      

      socketInstance = io({
        auth: {
          token
        }
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected');
      });

      socketInstance.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
      });

      setSocket(socketInstance);
    }


    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};