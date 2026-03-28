import { Users, Plus } from 'lucide-react';

const EmptyState = ({ onCreateGroup }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <Users className="w-10 h-10 text-gray-400" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-sage-900 mb-2">No groups found</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Try adjusting your filters or search query. You can also create a new group to get started!
      </p>
      <button
        onClick={onCreateGroup}
        className="inline-flex items-center gap-2 bg-sage-900 text-white px-6 py-3 rounded-md hover:bg-sage-800 transition active:scale-95 font-medium"
      >
        <Plus className="w-5 h-5" />
        Create Your First Group
      </button>
    </div>
  );
};

export default EmptyState;
