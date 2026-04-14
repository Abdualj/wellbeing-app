import { RefreshCw } from 'lucide-react';
import ProfileCard from '../components/Profile/ProfileCard';
import GroupCard from '../components/Profile/GroupCard';
import RecentActivity from '../components/Profile/RecentActivity';
import { useApp } from '../context/AppContext';

const Profile = () => {
    const { refetchProfile, profileLoading, groups } = useApp();

    return (
        <>
            <div className="min-h-screen bg-sage-50 backdrop-blur-sm flex flex-col items-center justify-center py-10">
                <div className="w-[640px] flex flex-col gap-6">
                    <ProfileCard />
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">My Groups ({groups.length})</h2>
                            <button
                                onClick={refetchProfile}
                                disabled={profileLoading}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-sage-700 bg-white border border-sage-300 rounded-lg hover:bg-sage-50 transition active:scale-95 disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${profileLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>
                        <GroupCard />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
                        <RecentActivity />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Profile;