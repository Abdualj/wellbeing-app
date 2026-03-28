import { useEffect } from 'react';
import ProfileCard from '../components/Profile/ProfileCard';
import GroupCard from '../components/Profile/GroupCard';
import RecentActivity from '../components/Profile/RecentActivity';
import { useApp } from '../context/AppContext';
import useUserProfile from '../Hooks/useUserProfile';

const Profile = () => {
    const { shouldRefreshProfile } = useApp();
    const { refetch } = useUserProfile();

    // Refetch profile data when shouldRefreshProfile changes
    useEffect(() => {
        if (shouldRefreshProfile > 0) {
            refetch();
        }
    }, [shouldRefreshProfile, refetch]);

    return (
        <>
            <div className="min-h-screen bg-sage-50 backdrop-blur-sm flex flex-col items-center justify-center py-10">
                <div className="w-[640px] flex flex-col gap-6">
                    <ProfileCard />
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">My Groups</h2>
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