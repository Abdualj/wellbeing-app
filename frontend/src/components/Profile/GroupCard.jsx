import { useNavigate } from 'react-router-dom';
import { Users, Plus, Crown, Star, RefreshCw, MessageCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useState, useEffect } from 'react';
import { messagesAPI } from '../../services/api';

const GroupCard = () => {
    const { groups = [], profileLoading: loading } = useApp();
    const navigate = useNavigate();
    const [unreadCounts, setUnreadCounts] = useState({});
    const [lastUpdate, setLastUpdate] = useState(new Date().toISOString());

    // Debug logging
    useEffect(() => {
        console.log('[GroupCard] 📊 Groups received:', groups.length);
        console.log('[GroupCard] 📋 Groups updated at:', new Date().toISOString());
        console.log('[GroupCard] 📋 Groups data:', JSON.stringify(groups, null, 2));
        groups.forEach(group => {
            console.log(`[GroupCard] 👥 Group: ${group.name}, Role: ${group.role}, ID: ${group.id}`);
        });
        setLastUpdate(new Date().toISOString());
    }, [groups]);

    // Fetch unread counts for all groups
    useEffect(() => {
        if (groups.length === 0) return;

        const fetchUnreadCounts = async () => {
            try {
                const groupIds = groups.map(g => g.id);
                const response = await messagesAPI.getUnreadCounts(groupIds);
                setUnreadCounts(response.data || {});
            } catch (error) {
                console.error('Failed to fetch unread counts:', error);
            }
        };

        fetchUnreadCounts();
    }, [groups]);

    // Separate groups into created (ADMIN) and joined (MEMBER/FACILITATOR)
    const createdGroups = groups.filter(group => group.role === 'ADMIN');
    const joinedGroups = groups.filter(group => group.role !== 'ADMIN');

    console.log('[GroupCard] 👑 Created groups:', createdGroups.length, createdGroups);
    console.log('[GroupCard] 🤝 Joined groups:', joinedGroups.length, joinedGroups);
    console.log('[GroupCard] 🎨 Will render created section:', createdGroups.length > 0);
    console.log('[GroupCard] 🎨 Will render joined section:', joinedGroups.length > 0);

    if (loading) {
        return (
            <div className="w-full space-y-4 sm:space-y-6">
                <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
                    <div className="animate-pulse space-y-3 sm:space-y-4">
                        <div className="h-14 sm:h-16 bg-gray-200 rounded-lg"></div>
                        <div className="h-14 sm:h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (groups.length === 0) {
        return (
            <div className="w-full bg-white rounded-xl p-6 sm:p-8 border border-gray-200 text-center">
                <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">No Groups Yet</h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">
                    Join groups to connect with others and participate in activities
                </p>
                <button
                    onClick={() => navigate('/groups')}
                    className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 bg-sage-900 text-white rounded-md hover:bg-sage-800 transition active:scale-95 text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Discover Groups
                </button>
            </div>
        );
    }

    const renderGroupCard = (group) => {
        console.log('[GroupCard] 🎨 Rendering card for group:', group.name, group.id);
        const unreadCount = unreadCounts[group.id] || 0;
        
        return (
            <div 
                key={group.id}
                className="flex items-center gap-2 sm:gap-3 bg-white rounded-xl p-3 sm:p-4 border border-gray-200 hover:border-sage-300 hover:shadow-md transition group"
            >
                <img 
                    src={group.avatar || 'https://via.placeholder.com/48'} 
                    alt={group.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0" 
                />
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-800 truncate group-hover:text-sage-900 transition">
                        {group.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-sage-600 font-medium uppercase tracking-wide">
                        {group.role === 'ADMIN' ? 'Creator' : group.role === 'FACILITATOR' ? 'Facilitator' : 'Member'}
                    </p>
                    <div className="flex items-center mt-0.5 sm:mt-1">
                        <Users className="w-3 h-3 text-gray-400 mr-1" />
                        <span className="text-[10px] sm:text-xs text-gray-500">{group.memberCount || 0} members</span>
                    </div>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/groups/${group.id}/chat`);
                    }}
                    className="relative p-2 sm:p-2.5 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition active:scale-95 flex-shrink-0"
                    title="Open chat"
                >
                    <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </div>
        );
    };

    return (
        <div className="w-full space-y-4 sm:space-y-6">
            {/* Loading indicator when refreshing */}
            {loading && (
                <div className="flex items-center justify-center gap-2 py-2 px-3 sm:px-4 bg-sage-50 border border-sage-200 rounded-lg">
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 text-sage-600 animate-spin" />
                    <span className="text-xs sm:text-sm text-sage-700 font-medium">Updating your groups...</span>
                </div>
            )}
            
            {/* Created Groups Section */}
            {createdGroups.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                        <h3 className="text-sm sm:text-md font-semibold text-gray-700">
                            Created by You ({createdGroups.length})
                        </h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                        {createdGroups.map((group) => (
                            <div 
                                key={group.id}
                                className="flex items-center gap-2 sm:gap-3 bg-white rounded-xl p-3 sm:p-4 border border-gray-200 hover:border-amber-400 hover:shadow-md transition"
                            >
                                <img 
                                    src={group.avatar || 'https://via.placeholder.com/48'} 
                                    alt={group.name}
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0" 
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm sm:text-base text-gray-800 truncate">
                                        {group.name}
                                    </h3>
                                    <p className="text-[10px] sm:text-xs text-amber-600 font-medium uppercase tracking-wide">
                                        Creator
                                    </p>
                                    <div className="flex items-center mt-0.5 sm:mt-1">
                                        <Users className="w-3 h-3 text-gray-400 mr-1" />
                                        <span className="text-[10px] sm:text-xs text-gray-500">{group.memberCount || 0} members</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/groups/${group.id}/chat`)}
                                    className="relative p-2 sm:p-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition active:scale-95 flex-shrink-0"
                                    title="Open chat"
                                >
                                    <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    {(unreadCounts[group.id] || 0) > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                                            {unreadCounts[group.id] > 9 ? '9+' : unreadCounts[group.id]}
                                        </span>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Joined Groups Section */}
            {joinedGroups.length > 0 && (
                <div className="bg-sage-50 border border-sage-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-sage-600" />
                        <h3 className="text-sm sm:text-md font-semibold text-gray-700">
                            Joined Groups ({joinedGroups.length})
                        </h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                        {joinedGroups.map((group) => (
                            <div 
                                key={group.id}
                                className="flex items-center gap-2 sm:gap-3 bg-white rounded-xl p-3 sm:p-4 border border-gray-200 hover:border-sage-400 hover:shadow-md transition"
                            >
                                <img 
                                    src={group.avatar || 'https://via.placeholder.com/48'} 
                                    alt={group.name}
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0" 
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm sm:text-base text-gray-800 truncate">
                                        {group.name}
                                    </h3>
                                    <p className="text-[10px] sm:text-xs text-sage-600 font-medium uppercase tracking-wide">
                                        {group.role === 'FACILITATOR' ? 'Facilitator' : 'Member'}
                                    </p>
                                    <div className="flex items-center mt-0.5 sm:mt-1">
                                        <Users className="w-3 h-3 text-gray-400 mr-1" />
                                        <span className="text-[10px] sm:text-xs text-gray-500">{group.memberCount || 0} members</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/groups/${group.id}/chat`)}
                                    className="relative p-2 sm:p-2.5 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition active:scale-95 flex-shrink-0"
                                    title="Open chat"
                                >
                                    <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    {(unreadCounts[group.id] || 0) > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                                            {unreadCounts[group.id] > 9 ? '9+' : unreadCounts[group.id]}
                                        </span>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default GroupCard;