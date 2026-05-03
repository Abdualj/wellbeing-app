import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, MoreVertical, Edit2, Trash2, Loader } from 'lucide-react';
import { messagesAPI, groupsAPI } from '../services/api';
import useSocket from '../Hooks/useSocket';
import { useApp } from '../context/AppContext';

const GroupChat = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user, showToast } = useApp();
  const { socket, isConnected } = useSocket(groupId);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [editingMessage, setEditingMessage] = useState(null);
  const [groupInfo, setGroupInfo] = useState(null);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages
  useEffect(() => {
    loadMessages();
    loadGroupInfo();
  }, [groupId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !groupId) return;

    // Listen for new messages
    socket.on('message:new', (message) => {
      if (message.groupId === groupId) {
        setMessages((prev) => [...prev, message]);
        
        // Mark as read if not own message
        if (message.userId !== user?.id) {
          messagesAPI.markAsRead(message.id).catch(console.error);
        }
      }
    });

    // Listen for message edits
    socket.on('message:edited', (message) => {
      if (message.groupId === groupId) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === message.id ? message : msg))
        );
      }
    });

    // Listen for message deletions
    socket.on('message:deleted', ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, isDeleted: true, content: '[Message deleted]' }
            : msg
        )
      );
    });

    // Listen for typing indicators
    socket.on('user:typing', ({ userId }) => {
      if (userId !== user?.id) {
        setTypingUsers((prev) => new Set([...prev, userId]));
      }
    });

    socket.on('user:stop-typing', ({ userId }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    // Cleanup
    return () => {
      socket.off('message:new');
      socket.off('message:edited');
      socket.off('message:deleted');
      socket.off('user:typing');
      socket.off('user:stop-typing');
    };
  }, [socket, groupId, user]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messagesAPI.getGroupMessages(groupId, { limit: 50 });
      setMessages(response.data || []);
      
      // Mark all as read
      await messagesAPI.markAllAsRead(groupId);
    } catch (error) {
      console.error('Error loading messages:', error);
      showToast('Failed to load messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadGroupInfo = async () => {
    try {
      const response = await groupsAPI.getById(groupId);
      setGroupInfo(response.data);
    } catch (error) {
      console.error('Error loading group info:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      
      if (editingMessage) {
        // Edit existing message
        await messagesAPI.edit(editingMessage.id, newMessage);
        setEditingMessage(null);
      } else {
        // Send new message
        await messagesAPI.send(groupId, newMessage);
      }
      
      setNewMessage('');
      
      // Stop typing indicator
      if (socket) {
        socket.emit('typing:stop', { groupId });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!socket) return;

    // Emit typing event
    socket.emit('typing:start', { groupId });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', { groupId });
    }, 2000);
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setNewMessage(message.content);
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await messagesAPI.delete(messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
      showToast('Failed to delete message', 'error');
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const grouped = {};
    messages.forEach((message) => {
      const date = formatDate(message.createdAt);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(message);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-sage-50">
        <Loader className="w-8 h-8 text-sage-600 animate-spin" />
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate();

  return (
    <div className="flex flex-col h-screen bg-sage-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={() => navigate('/groups')}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {groupInfo?.name || 'Loading...'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                {isConnected ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Connected
                  </span>
                ) : (
                  <span className="text-gray-400">Connecting...</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4 space-y-4 sm:space-y-6">
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center justify-center my-4">
              <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                {date}
              </span>
            </div>

            {/* Messages for this date */}
            {msgs.map((message) => {
              const isOwnMessage = message.userId === user?.id;
              
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 mb-4 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  {!isOwnMessage && (
                    <img
                      src={message.user?.avatar || '/default-avatar.png'}
                      alt={message.user?.firstName}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                  )}

                  {/* Message bubble */}
                  <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    {!isOwnMessage && (
                      <span className="text-xs text-gray-600 mb-1 px-2">
                        {message.user?.displayName || `${message.user?.firstName} ${message.user?.lastName}`}
                      </span>
                    )}
                    
                    <div
                      className={`group relative px-4 py-2 rounded-2xl ${
                        isOwnMessage
                          ? 'bg-sage-600 text-white'
                          : message.isDeleted
                          ? 'bg-gray-100 text-gray-400 italic'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      
                      {message.isEdited && !message.isDeleted && (
                        <span className="text-xs opacity-70 ml-2">(edited)</span>
                      )}

                      {/* Message actions */}
                      {isOwnMessage && !message.isDeleted && (
                        <div className="absolute right-0 top-0 hidden group-hover:flex gap-1 -mt-2 -mr-2 bg-white rounded-lg shadow-lg border border-gray-200 p-1">
                          <button
                            onClick={() => handleEditMessage(message)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="p-1 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </button>
                        </div>
                      )}
                    </div>

                    <span className="text-xs text-gray-400 mt-1 px-2">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        {typingUsers.size > 0 && (
          <div className="flex items-center gap-2 text-gray-500 text-sm px-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span>Someone is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        {editingMessage && (
          <div className="flex items-center justify-between mb-2 px-4 py-2 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-700">Editing message</span>
            <button
              onClick={() => {
                setEditingMessage(null);
                setNewMessage('');
              }}
              className="text-blue-700 hover:text-blue-900"
            >
              Cancel
            </button>
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          <textarea
            value={newMessage}
            onChange={handleTyping}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Type a message..."
            rows="1"
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-3 bg-sage-600 text-white rounded-xl hover:bg-sage-700 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GroupChat;
