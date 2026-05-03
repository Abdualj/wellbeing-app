import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { io } from 'socket.io-client';
import { useLocation } from 'react-router-dom';

const GlobalNotifications = () => {
  const { groups, sendNotification } = useApp();
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    if (!groups || groups.length === 0) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    // Connect to WebSocket for all user's groups
    const socket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('[GlobalNotifications] Connected to WebSocket');
      
      // Join all groups the user is a member of
      groups.forEach(group => {
        socket.emit('join-group', group.id);
      });
    });

    // Listen for new messages across all groups
    socket.on('message:new', (data) => {
      const { message, groupId } = data;
      
      // Don't show notification if user is on the chat page for this group
      const isOnChatPage = location.pathname === `/groups/${groupId}/chat`;
      if (isOnChatPage) return;

      // Find the group name
      const group = groups.find(g => g.id === groupId);
      const groupName = group?.name || 'Group';

      // Send browser notification
      sendNotification(
        `New message in ${groupName}`,
        message.content.substring(0, 100),
        {
          tag: `group-${groupId}`,
          requireInteraction: false,
        }
      );
    });

    socket.on('connect_error', (error) => {
      console.error('[GlobalNotifications] Connection error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, [groups, sendNotification, location.pathname]);

  return null; // This component doesn't render anything
};

export default GlobalNotifications;
