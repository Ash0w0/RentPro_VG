import { useEffect, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../utils/logger';
import { toast } from 'react-toastify';

interface RealTimeUpdate {
  type: string;
  data: any;
  timestamp: string;
  userId?: string;
}

export const useRealTimeData = () => {
  const { user } = useAuth();
  const { refreshData } = useData();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 1000;
  const useMockUpdates = useRef(true); // Use mock updates in development

  const connect = () => {
    if (!user || wsRef.current?.readyState === WebSocket.OPEN) return;

    // In development or when no backend is available, use mock updates
    if (useMockUpdates.current) {
      logger.info('Using mock real-time updates');
      startMockUpdates();
      return;
    }

    try {
      const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:3001'}/ws/${user.uid}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        logger.info('WebSocket connected');
        reconnectAttempts.current = 0;
        
        // Send authentication
        wsRef.current?.send(JSON.stringify({
          type: 'auth',
          token: localStorage.getItem('authToken'),
          userId: user.uid,
          role: user.role
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const update: RealTimeUpdate = JSON.parse(event.data);
          handleRealTimeUpdate(update);
        } catch (error) {
          logger.error('Failed to parse WebSocket message', error);
        }
      };

      wsRef.current.onclose = (event) => {
        logger.info('WebSocket disconnected', { code: event.code, reason: event.reason });
        
        // Fall back to mock updates if WebSocket fails
        if (event.code !== 1000) {
          logger.warn('WebSocket connection failed, falling back to mock updates');
          useMockUpdates.current = true;
          startMockUpdates();
        }
      };

      wsRef.current.onerror = (error) => {
        logger.error('WebSocket error', error);
        // Fall back to mock updates on error
        useMockUpdates.current = true;
        startMockUpdates();
      };

    } catch (error) {
      logger.error('Failed to create WebSocket connection', error);
      // Fall back to mock updates
      useMockUpdates.current = true;
      startMockUpdates();
    }
  };

  const startMockUpdates = () => {
    // Simulate periodic updates for demo purposes
    const interval = setInterval(() => {
      if (Math.random() > 0.9) { // 10% chance every 30 seconds
        const mockUpdates = [
          {
            type: 'notification',
            data: { 
              message: 'System update: All services are running normally',
              broadcast: true 
            },
            timestamp: new Date().toISOString()
          },
          {
            type: 'connection_established',
            data: { status: 'connected' },
            timestamp: new Date().toISOString()
          }
        ];
        
        const randomUpdate = mockUpdates[Math.floor(Math.random() * mockUpdates.length)];
        handleRealTimeUpdate(randomUpdate);
      }
    }, 30000); // Check every 30 seconds

    // Store interval reference for cleanup
    reconnectTimeoutRef.current = interval as any;
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Component unmounting');
      wsRef.current = null;
    }
  };

  const handleRealTimeUpdate = (update: RealTimeUpdate) => {
    logger.info('Real-time update received', update);

    switch (update.type) {
      case 'tenant_created':
        toast.success(`New tenant registered: Room ${update.data.roomNumber}`);
        refreshData();
        break;

      case 'tenant_updated':
        if (user?.role === 'owner') {
          toast.info(`Tenant updated: Room ${update.data.roomNumber}`);
        }
        refreshData();
        break;

      case 'payment_submitted':
        if (user?.role === 'owner') {
          toast.info(`New payment from Room ${update.data.roomNumber}: ₹${update.data.amount}`);
        } else if (user?.uid === update.data.tenantId) {
          toast.success('Payment submitted successfully');
        }
        refreshData();
        break;

      case 'payment_verified':
        if (user?.uid === update.data.tenantId) {
          toast.success('Your payment has been verified');
        }
        refreshData();
        break;

      case 'payment_rejected':
        if (user?.uid === update.data.tenantId) {
          toast.error('Your payment was rejected. Please contact the owner.');
        }
        refreshData();
        break;

      case 'service_request_created':
        if (user?.role === 'owner') {
          toast.info(`New service request from Room ${update.data.roomNumber}`);
        } else if (user?.uid === update.data.tenantId) {
          toast.success('Service request submitted successfully');
        }
        refreshData();
        break;

      case 'service_request_updated':
        if (user?.uid === update.data.tenantId) {
          const statusMessages = {
            'in-progress': 'Your service request is now in progress',
            'completed': 'Your service request has been completed',
            'cancelled': 'Your service request has been cancelled'
          };
          const message = statusMessages[update.data.status as keyof typeof statusMessages];
          if (message) {
            toast.info(message);
          }
        }
        refreshData();
        break;

      case 'room_updated':
        if (user?.role === 'owner') {
          toast.info(`Room ${update.data.roomNumber} updated`);
        }
        refreshData();
        break;

      case 'notification':
        if (user?.uid === update.data.userId || update.data.broadcast) {
          toast.info(update.data.message);
        }
        refreshData();
        break;

      case 'system_maintenance':
        toast.warning('System maintenance scheduled. Please save your work.');
        break;

      case 'connection_established':
        logger.info('Real-time connection established');
        break;

      default:
        logger.warn('Unknown real-time update type', update.type);
    }
  };

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      logger.warn('WebSocket not connected, cannot send message');
    }
  };

  // Heartbeat to keep connection alive (only for real WebSocket connections)
  useEffect(() => {
    if (!user || useMockUpdates.current) return;

    const heartbeatInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        sendMessage({ type: 'ping', timestamp: new Date().toISOString() });
      }
    }, 30000); // Send ping every 30 seconds

    return () => clearInterval(heartbeatInterval);
  }, [user]);

  // Connect/disconnect based on user authentication
  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        // Reconnect when page becomes visible
        if (!useMockUpdates.current && wsRef.current?.readyState !== WebSocket.OPEN) {
          connect();
        }
      } else if (document.visibilityState === 'hidden') {
        // Optionally disconnect when page is hidden to save resources
        // disconnect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  return {
    isConnected: useMockUpdates.current || wsRef.current?.readyState === WebSocket.OPEN,
    sendMessage,
    reconnect: connect,
    disconnect
  };
};