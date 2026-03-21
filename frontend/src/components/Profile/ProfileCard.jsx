import { SquarePen, Settings } from 'lucide-react';
import { useState } from 'react';
import EditModal from './Modal'
import useUserProfile from '../../Hooks/useUserProfile'

const ProfileCard = () => {
    const [isEdit, setEdit] = useState(false)
    const { user, groups = [], refetch } = useUserProfile();


  const uploadPfp= async (file) => {
    try {

        const formData = new FormData();
        formData.append('avatar', file)

        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/v1/users/profile', {
            method: 'PUT',
            headers: {
            'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (res.ok) {
            refetch()
        } 
    } catch (error) {
        console.log('Error', error.message)
        }
    };

    const handleSave = () => {
        refetch()
    }

    const handlePfpChange = (e) => {
        const file = e.target.files[0]
        if (file) {
                uploadPfp(file)
        }
    }

console.log(user);
    return (
        <div className="w-full bg-white rounded shadow">
            <div className="flex items-start gap-4 p-6">
                <div className="relative w-20 h-20">
                    <img 
                        src={user?.avatar || "/default-avatar.png"} 
                        className="w-20 h-20 rounded-full object-cover shrink-0"
                    />
                    <input 
                        type="file"
                        accept="image/*"
                        onChange={handlePfpChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                    />
                    </div>
                 <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-sage-900">{user?.firstName} {user?.lastName}</h1>
                            <p className="text-sm text-gray-400">{user?.joinedAt}</p>
                        </div>
                        <div className="flex gap-2">
                            <button type="button" className="flex items-center gap-2 text-gray-700 border border-gray-300 rounded text-sm h-10 px-4 bg-white active:scale-95 transition hover:bg-gray-50" onClick={() => setEdit(true)}>
                                <SquarePen className="w-4 h-4" /> Edit Profile
                            </button>
                            <button type="button" className="flex items-center justify-center text-gray-600 h-10 w-10 rounded active:scale-95 transition">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mt-4">
                        <div className="bg-green-50 rounded-xl p-4">
                            <h3 className="text-sm font-medium text-gray-500">Groups</h3>
                            <p className="text-2xl font-bold text-green-800">{groups.length}</p>
                        </div>
                        <div className="bg-pink-50 rounded-xl p-4">
                            <h3 className="text-sm font-medium text-gray-500">Total Likes</h3>
                            <p className="text-2xl font-bold text-pink-700">{user?.totalLikes || 0}</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-4">
                            <h3 className="text-sm font-medium text-gray-500">Activities</h3>
                            <p className="text-2xl font-bold text-blue-700">{user?.activities || 0}</p>
                        </div>
                        <div className="bg-yellow-50 rounded-xl p-4">
                            <h3 className="text-sm font-medium text-gray-500">Days Active</h3>
                            <p className="text-2xl font-bold text-yellow-700">{user?.daysActive || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="ml-[104px] mr-6 border-t border-gray-200"></div>

            <div className="px-6 pb-8 pt-4">
                <h2 className="font-semibold text-gray-800">About</h2>
                <p className="text-sm text-gray-500 mt-1">{user?.bio || "No bio added yet"}</p>
            </div>

            <EditModal isOpen={isEdit} setEdit={setEdit} user={user} refetch={refetch} />
        </div>
    )
};

export default ProfileCard;

