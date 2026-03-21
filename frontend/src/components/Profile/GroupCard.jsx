import useUserProfile from "../../Hooks/useUserProfile"

const GroupCard = () => {
    const { groups = [] } = useUserProfile();
    return (
        <div className="w-[600px] grid grid-cols-2 gap-4">
            {groups.map(group => (
                <>
                    <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-200">
                        <img src={group.image} className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                            <h3 className="font-semibold text-gray-800">{group.name}</h3>
                            <p className="text-sm text-gray-400">{group.category}</p>
                            <div className="flex items-center mt-1">
                   
                                <div className="flex -space-x-2">
                                    <img src={group.avatar} className="w-6 h-6 rounded-full border-2 border-white" />
                                    <img src={group.avatar} className="w-6 h-6 rounded-full border-2 border-white" />
                                </div>
                                <span className="text-xs text-gray-400 ml-2">{group.memberCount}</span>
                            </div>
                        </div>
                    </div>
                </>
                
            ))}
        </div>
    );
}

export default GroupCard;