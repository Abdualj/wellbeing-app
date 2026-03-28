import { Users, MapPin, Check, Clock } from 'lucide-react';

const GroupCard = ({ group, isUserInGroup, status, onJoinGroup, isJoining }) => {
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
      <div className="relative h-48 overflow-hidden bg-gray-200">
        <img
          src={group.image || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={group.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
        {getStatusBadge() && (
          <div className="absolute top-3 right-3">
            {getStatusBadge()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-sage-900 mb-1 line-clamp-1">{group.name}</h3>
          <span className="inline-block px-2 py-1 text-xs font-medium bg-sage-100 text-sage-700 rounded">
            {group.activity || group.category}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
          {group.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{group.memberCount || 0}/{group.capacity || 0} members</span>
          </div>
          {group.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{group.location}</span>
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
            className="w-full bg-sage-900 text-white py-2.5 rounded-md hover:bg-sage-800 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isJoining ? 'Joining...' : 'Join Group'}
          </button>
        )}

        {isUserInGroup && (
          <button
            className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-md cursor-default font-medium"
            disabled
          >
            Member
          </button>
        )}

        {status === 'full' && !isUserInGroup && (
          <button
            className="w-full bg-gray-100 text-gray-500 py-2.5 rounded-md cursor-not-allowed font-medium"
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
