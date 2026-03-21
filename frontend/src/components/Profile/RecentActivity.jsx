import useUserProfile from "../../Hooks/useUserProfile"

const RecentActivity = () => {
    const { groups = [] } = useUserProfile();
    const tags = [...new Set(groups.map(group => group.category))].filter(Boolean);

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow p-6 w-full">
            <h2 className="text-lg font-semibold text-gray-800">Your Wellness Journey</h2>
            <div className="border-t border-gray-200 mt-6 pt-4">
                {tags.length > 0 && (
                    <div className="mt-6 pt-4">
                        <p className="text-sm text-gray-600 mb-3">Most Active in</p>
                        <div className="flex gap-2 flex-wrap">
                            {tags.map((tag) => (
                                <span key={tag} className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="border-t border-gray-200 mt-6 pt-4">
                <p className="text-sm text-gray-500 italic">"Remember: Progress over perfection. You're doing great!"</p>
            </div>
        </div>
    );
};

export default RecentActivity;