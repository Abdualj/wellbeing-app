import { Users, MapPin, Check, Clock, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { messagesAPI } from '../../services/api';
import { useSocket } from '../../Hooks/useSocket';

const GroupCard = ({ group, isUserInGroup, status, onJoinGroup, isJoining }) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useSocket(isUserInGroup ? group.id : null);

  // Fetch unread count for groups the user has joined
  useEffect(() => {
    if (isUserInGroup && group.id) {
      messagesAPI.getUnreadCount(group.id)
        .then(response => {
          setUnreadCount(response.unreadCount || 0);
        })
        .catch(error => {
          console.error('Failed to fetch unread count:', error);
        });
    }
  }, [isUserInGroup, group.id]);

  // Listen for new messages to update unread count
  useEffect(() => {
    if (!socket || !isUserInGroup) return;

    const handleNewMessage = () => {
      // Increment unread count when new message arrives
      setUnreadCount(prev => prev + 1);
    };

    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('message:new', handleNewMessage);
    };
  }, [socket, isUserInGroup]);
  const getStatusBadge = () => {
    switch (status) {
      case 'joined':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <Check className="w-3 h-3" />
            Joined
          </span>
        );
      case 'full':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            Full
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
      {/* Image */}
      <div className="relative h-40 sm:h-48 overflow-hidden bg-gray-200">
        <img
          src={group.image || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={group.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
        {getStatusBadge() && (
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
            {getStatusBadge()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-5">
        <div className="mb-2 sm:mb-3">
          <h3 className="text-base sm:text-lg font-bold text-sage-900 mb-1 line-clamp-1">{group.name}</h3>
          <span className="inline-block px-2 py-1 text-xs font-medium bg-sage-100 text-sage-700 rounded">
            {group.activity || group.category}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 min-h-[32px] sm:min-h-[40px]">
          {group.description}
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 gap-2">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{group.memberCount || 0}/{group.capacity || 0} members</span>
          </div>
          {group.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="truncate text-xs sm:text-sm">{group.location}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        {!isUserInGroup && status !== 'full' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onJoinGroup(group.id);
            }}
            disabled={isJoining}
            className="w-full bg-sage-900 text-white py-2 sm:py-2.5 rounded-md hover:bg-sage-800 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
          >
            {isJoining ? 'Joining...' : 'Join Group'}
          </button>
        )}

        {isUserInGroup && (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/groups/${group.id}/chat`);
              }}
              className="flex-1 bg-sage-600 text-white py-2 sm:py-2.5 rounded-md hover:bg-sage-700 transition active:scale-95 font-medium flex items-center justify-center gap-2 relative text-sm sm:text-base"
            >
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              Chat
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button
              className="px-3 sm:px-4 bg-gray-100 text-gray-700 py-2 sm:py-2.5 rounded-md font-medium text-sm sm:text-base"
              title="Member"
            >
              ✓
            </button>
          </div>
        )}

        {status === 'full' && !isUserInGroup && (
          <button
            className="w-full bg-gray-100 text-gray-500 py-2 sm:py-2.5 rounded-md cursor-not-allowed font-medium text-sm sm:text-base"
            disabled
          >
            Group Full
          </button>
        )}
      </div>
    </div>
  );
};

export default GroupCard;
