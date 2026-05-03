import { useApp } from '../../context/AppContext';

const RecentActivity = () => {
    const { groups = [] } = useApp();
    const tags = [...new Set(groups.map(group => group.category))].filter(Boolean);

    return (
        <div className="bg-white/60 backdrop-blur-sm border border-sage-200/50 rounded-2xl shadow p-4 sm:p-6 w-full">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Your Wellness Journey</h2>
            <div className="border-t border-gray-200 mt-4 sm:mt-6 pt-3 sm:pt-4">
                {tags.length > 0 && (
                    <div className="mt-4 sm:mt-6 pt-3 sm:pt-4">
                        <p className="text-xs sm:text-sm text-sage-600 mb-2 sm:mb-3">Most Active in</p>
                        <div className="flex gap-2 flex-wrap">
                            {tags.map((tag) => (
                                <span key={tag} className="bg-orange-50 border border-sage-200 text-sage-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="border-t border-gray-200 mt-4 sm:mt-6 pt-3 sm:pt-4">
                <p className="text-xs sm:text-sm text-gray-500 italic">"Remember: Progress over perfection. You're doing great!"</p>
            </div>
        </div>
    );
};

export default RecentActivity;