"use client";

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

export const useNotifications = () => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Connect to WebSocket server
    // Assuming backend is on port 3001 or proxied via Next.js
    // For local dev, backend is usually http://localhost:3001
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    socketRef.current = io(socketUrl, {
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to notification server');
      // Join user room if needed, but gateway handles it by default or we can emit a join event
      socketRef.current?.emit('join', { userId: user._id });
    });

    socketRef.current.on('upload-complete', (data: any) => {
      console.log('Upload complete:', data);
      
      if (Notification.permission === 'granted') {
        new Notification('Bulk Upload Completed', {
          body: `Successfully uploaded ${data.successCount} workflows. Failed: ${data.failCount}.`,
          icon: '/favicon.ico', // Replace with actual icon path
        });
      } else {
        // Fallback to alert or toast if needed
        alert(`Bulk Upload Completed: ${data.successCount} success, ${data.failCount} failed.`);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  return socketRef.current;
};
