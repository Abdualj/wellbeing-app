import ProfileCard from '../components/Profile/ProfileCard';
import GroupCard from '../components/Profile/GroupCard';
import RecentActivity from '../components/Profile/RecentActivity';

const Profile = () => {
    return (
        <>
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-10">
                <div className="w-[640px] flex flex-col gap-4">
                    <ProfileCard />
                    <h2 className="text-lg font-semibold text-gray-700">My Groups</h2>
                    <GroupCard />
                    <h2 className="text-lg font-semibold text-gray-700">Recent Activity</h2>
                    <RecentActivity />
                </div>
            </div>
        </>
    )
}

export default Profile;