import { Search } from 'lucide-react';

const SearchBar = ({ searchQuery, onSearchChange, sortBy, onSortChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search groups by name or description..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sage-500 focus:border-transparent"
          />
        </div>

        {/* Sort Dropdown */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sage-500 focus:border-transparent bg-white"
          >
            <option value="newest">Newest First</option>
            <option value="popular">Most Popular</option>
            <option value="alphabetical">A-Z</option>
            <option value="available">Available Spots</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
