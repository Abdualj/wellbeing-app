import { RefreshCw } from 'lucide-react';
import ProfileCard from '../components/Profile/ProfileCard';
import GroupCard from '../components/Profile/GroupCard';
import RecentActivity from '../components/Profile/RecentActivity';
import { useApp } from '../context/AppContext';

const Profile = () => {
    const { refetchProfile, profileLoading, groups } = useApp();

    return (
        <>
            <div className="min-h-screen bg-sage-50 backdrop-blur-sm flex flex-col items-center justify-center py-6 sm:py-10 px-3 sm:px-4">
                <div className="w-full max-w-[640px] flex flex-col gap-4 sm:gap-6">
                    <ProfileCard />
                    <div>
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-800">My Groups ({groups.length})</h2>
                            <button
                                onClick={refetchProfile}
                                disabled={profileLoading}
                                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-sage-700 bg-white border border-sage-300 rounded-lg hover:bg-sage-50 transition active:scale-95 disabled:opacity-50"
                            >
                                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${profileLoading ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>
                        </div>
                        <GroupCard />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Recent Activity</h2>
                        <RecentActivity />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Profile;