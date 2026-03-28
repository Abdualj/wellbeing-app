import { useNavigate } from 'react-router-dom';
import { Users, Plus, Crown, Star } from 'lucide-react';
import useUserProfile from "../../Hooks/useUserProfile";

const GroupCard = () => {
    const { groups = [], loading } = useUserProfile();
    const navigate = useNavigate();

    // Separate groups into created (ADMIN) and joined (MEMBER/FACILITATOR)
    const createdGroups = groups.filter(group => group.role === 'ADMIN');
    const joinedGroups = groups.filter(group => group.role !== 'ADMIN');

    if (loading) {
        return (
            <div className="w-[600px] space-y-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="animate-pulse space-y-4">
                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (groups.length === 0) {
        return (
            <div className="w-[600px] bg-white rounded-xl p-8 border border-gray-200 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">No Groups Yet</h3>
                <p className="text-sm text-gray-500 mb-4">
                    Join groups to connect with others and participate in activities
                </p>
                <button
                    onClick={() => navigate('/groups')}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-sage-900 text-white rounded-md hover:bg-sage-800 transition active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Discover Groups
                </button>
            </div>
        );
    }

    const renderGroupCard = (group) => (
        <div 
            key={group.id}
            className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-200 hover:border-sage-300 hover:shadow-md transition cursor-pointer group"
            onClick={() => navigate('/groups')}
            title={`${group.name} - ${group.role}`}
        >
            <img 
                src={group.avatar || 'https://via.placeholder.com/48'} 
                alt={group.name}
                className="w-12 h-12 rounded-lg object-cover bg-gray-100" 
            />
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate group-hover:text-sage-900 transition">
                    {group.name}
                </h3>
                <p className="text-xs text-sage-600 font-medium uppercase tracking-wide">
                    {group.role === 'ADMIN' ? 'Creator' : group.role === 'FACILITATOR' ? 'Facilitator' : 'Member'}
                </p>
                <div className="flex items-center mt-1">
                    <Users className="w-3 h-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">{group.memberCount || 0} members</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-[600px] space-y-6">
            {/* Created Groups Section */}
            {createdGroups.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Crown className="w-5 h-5 text-amber-600" />
                        <h3 className="text-md font-semibold text-gray-700">
                            Created by You ({createdGroups.length})
                        </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {createdGroups.map(renderGroupCard)}
                    </div>
                </div>
            )}

            {/* Joined Groups Section */}
            {joinedGroups.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Users className="w-5 h-5 text-sage-600" />
                        <h3 className="text-md font-semibold text-gray-700">
                            Joined Groups ({joinedGroups.length})
                        </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {joinedGroups.map(renderGroupCard)}
                    </div>
                </div>
            )}
        </div>
    );
}

export default GroupCard;