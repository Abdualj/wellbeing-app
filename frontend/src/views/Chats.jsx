import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Users, Loader, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { messagesAPI } from '../services/api';

const Chats = () => {
  const navigate = useNavigate();
  const { groups, profileLoading } = useApp();
  const [unreadCounts, setUnreadCounts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnreadCounts = async () => {
      if (groups.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const groupIds = groups.map(g => g.id);
        const response = await messagesAPI.getUnreadCounts(groupIds);
        setUnreadCounts(response.data || {});
      } catch (error) {
        console.error('Failed to fetch unread counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnreadCounts();
  }, [groups]);

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (profileLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-sage-50">
        <Loader className="w-8 h-8 text-sage-600 animate-spin" />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="min-h-screen bg-sage-50 pt-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Chats Yet</h2>
            <p className="text-gray-600 mb-6">
              Join groups to start chatting with other members
            </p>
            <button
              onClick={() => navigate('/groups')}
              className="px-6 py-3 bg-sage-900 text-white rounded-lg hover:bg-sage-800 transition active:scale-95"
            >
              Discover Groups
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage-50 pt-24 px-6 pb-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Chats</h1>
          <p className="text-gray-600">
            Chat with {groups.length} group{groups.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="space-y-3">
          {filteredGroups.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
              <p className="text-gray-500">No groups found matching "{searchTerm}"</p>
            </div>
          ) : (
            filteredGroups.map((group) => {
              const unreadCount = unreadCounts[group.id] || 0;

              return (
                <div
                  key={group.id}
                  onClick={() => navigate(`/groups/${group.id}/chat`)}
                  className="bg-white rounded-xl p-5 border border-gray-200 hover:border-sage-300 hover:shadow-md transition cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    {/* Group Avatar */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={group.avatar || 'https://via.placeholder.com/64'}
                        alt={group.name}
                        className="w-16 h-16 rounded-xl object-cover bg-gray-100"
                      />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Group Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg truncate group-hover:text-sage-900 transition">
                        {group.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-sage-600 font-medium uppercase tracking-wide">
                          {group.role === 'ADMIN' ? 'Creator' : group.role === 'FACILITATOR' ? 'Facilitator' : 'Member'}
                        </span>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center">
                          <Users className="w-3 h-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">{group.memberCount || 0} members</span>
                        </div>
                      </div>
                      {group.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-1">
                          {group.description}
                        </p>
                      )}
                    </div>

                    {/* Chat Icon */}
                    <div className="flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-sage-600 group-hover:text-sage-700 transition" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Chats;
