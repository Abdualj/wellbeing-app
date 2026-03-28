import { Filter } from 'lucide-react';

const GroupsFilter = ({ categories, selectedFilter, onFilterChange, showJoinedOnly, onToggleJoinedOnly }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-sage-900" />
        <h3 className="font-semibold text-sage-900">Filter by Activity</h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onFilterChange(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition active:scale-95 ${
              selectedFilter === category.id
                ? 'bg-sage-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
        <input
          type="checkbox"
          id="myGroups"
          checked={showJoinedOnly}
          onChange={onToggleJoinedOnly}
          className="w-4 h-4 text-sage-900 bg-gray-100 border-gray-300 rounded focus:ring-sage-500"
        />
        <label htmlFor="myGroups" className="text-sm font-medium text-gray-700 cursor-pointer">
          Show only my groups
        </label>
      </div>
    </div>
  );
};

export default GroupsFilter;
