import { useState, useEffect, useMemo } from 'react';
import { Users, Plus, Filter, Search, MapPin, Clock, TrendingUp } from 'lucide-react';
import GroupCard from '../components/Groups/GroupCard';
import GroupsFilter from '../components/Groups/GroupsFilter';
import SearchBar from '../components/Groups/SearchBar';
import EmptyState from '../components/Groups/EmptyState';
import LoadingSkeleton from '../components/Groups/LoadingSkeleton';
import CreateGroupModal from '../components/Groups/CreateGroupModal';
import { groupsAPI } from '../services/api';
import { useApp } from '../context/AppContext';

const Groups = () => {
  // Context
  const { triggerProfileRefresh, showToast } = useApp();
  
  // State Management
  const [groups, setGroups] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showJoinedOnly, setShowJoinedOnly] = useState(false);
  const [joiningGroupId, setJoiningGroupId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Get current user ID from localStorage
  const currentUserId = localStorage.getItem('userId') || 'user123';

  // Activity Categories
  const activityCategories = [
    {
      id: 'all',
      label: 'All Activities',
      activities: [],
    },
    {
      id: 'physical',
      label: 'Physical',
      activities: ['Running', 'Soccer', 'Cycling', 'Swimming', 'Yoga', 'Hiking', 'Walking Challenge'],
    },
    {
      id: 'social',
      label: 'Social & Creative',
      activities: ['Wine Tasting', 'Book Club', 'Cooking', 'Photography'],
    },
    {
      id: 'wellness',
      label: 'Wellness',
      activities: ['Meditation', 'Yoga', 'Breathwork'],
    },
    {
      id: 'support',
      label: 'Support & Recovery',
      activities: ['AA', 'NA', 'Mental Health Support'],
    },
  ];

  // Fetch groups from API
  useEffect(() => {
    fetchGroups();
  }, [selectedFilter, searchQuery, sortBy]);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {};
      
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      if (selectedFilter !== 'all') {
        const category = activityCategories.find(cat => cat.id === selectedFilter);
        if (category && category.activities.length > 0) {
          params.activity = category.activities.join(',');
        }
      }
      
      if (sortBy && sortBy !== 'newest') {
        params.sortBy = sortBy;
      }

      const response = await groupsAPI.getAll(params);
      setGroups(response.data || []);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError(err.message);
      setGroups(getMockGroups());
    } finally {
      setIsLoading(false);
    }
  };

  // Helper Functions
  const isUserInGroup = (group) => {
    return group.members?.some(member => member.id === currentUserId || member.userId === currentUserId);
  };

  const getGroupStatus = (group) => {
    if (isUserInGroup(group)) return 'joined';
    if (group.memberCount >= group.capacity) return 'full';
    if (group.status === 'pending') return 'pending';
    return 'available';
  };

  // Filter groups
  const filterGroups = () => {
    let filtered = groups;

    if (selectedFilter !== 'all') {
      const category = activityCategories.find(cat => cat.id === selectedFilter);
      filtered = filtered.filter(group => 
        category.activities.some(activity => 
          group.activity?.toLowerCase().includes(activity.toLowerCase()) ||
          group.category?.toLowerCase().includes(activity.toLowerCase())
        )
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(group =>
        group.name?.toLowerCase().includes(query) ||
        group.description?.toLowerCase().includes(query) ||
        group.activity?.toLowerCase().includes(query)
      );
    }

    if (showJoinedOnly) {
      filtered = filtered.filter(isUserInGroup);
    }

    return filtered;
  };

  // Sort groups
  const sortGroups = (groupsToSort) => {
    const sorted = [...groupsToSort];

    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'popular':
        return sorted.sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));
      case 'alphabetical':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'available':
        return sorted.sort((a, b) => {
          const aSpots = (a.capacity || 0) - (a.memberCount || 0);
          const bSpots = (b.capacity || 0) - (b.memberCount || 0);
          return bSpots - aSpots;
        });
      default:
        return sorted;
    }
  };

  // Memoized filtered and sorted groups
  const filteredGroups = useMemo(() => {
    const filtered = filterGroups();
    return sortGroups(filtered);
  }, [groups, selectedFilter, searchQuery, sortBy, showJoinedOnly]);

  // Handle joining a group
  const handleJoinGroup = async (groupId) => {
    try {
      setJoiningGroupId(groupId);
      
      const response = await groupsAPI.join(groupId);

      setGroups(prevGroups =>
        prevGroups.map(group =>
          group.id === groupId
            ? {
                ...group,
                memberCount: (group.memberCount || 0) + 1,
                members: [...(group.members || []), { id: currentUserId }],
              }
            : group
        )
      );

      const groupName = groups.find(g => g.id === groupId)?.name;
      showToast(`You've joined ${groupName}! Check your profile to see it.`, 'success');
      
      // Wait a bit for backend to process, then trigger profile refresh
      setTimeout(() => {
        triggerProfileRefresh();
      }, 500);
    } catch (err) {
      console.error('Error joining group:', err);
      showToast(err.message || 'Failed to join group. Please try again.', 'error');
    } finally {
      setJoiningGroupId(null);
    }
  };

  // Handle creating a new group
  const handleCreateGroup = async (groupData) => {
    try {
      const response = await groupsAPI.create(groupData);
      
      // Add the new group to the list
      if (response && response.data) {
        setGroups(prevGroups => [response.data, ...prevGroups]);
        showToast(`Group "${groupData.name}" created successfully! Check your profile.`, 'success');
      }
      
      // Trigger profile refresh to update "My Groups" section
      triggerProfileRefresh();
      
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating group:', err);
      // Re-throw to show in the modal
      throw new Error(err.message || 'Failed to create group. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8">
      <div className="max-w-[1200px] mx-auto px-3 sm:px-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-sage-900">Discover Groups</h1>
              <p className="text-sm sm:text-base text-gray-500 mt-1">
                {filteredGroups.length} {filteredGroups.length === 1 ? 'group' : 'groups'} available
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 text-white bg-sage-900 px-4 sm:px-6 py-2.5 sm:py-3 rounded-md hover:bg-sage-800 transition active:scale-95 text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Create Group
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <GroupsFilter
          categories={activityCategories}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          showJoinedOnly={showJoinedOnly}
          onToggleJoinedOnly={() => setShowJoinedOnly(!showJoinedOnly)}
        />

        {/* Search & Sort Bar */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Loading State */}
        {isLoading && <LoadingSkeleton />}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchGroups}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition active:scale-95"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredGroups.length === 0 && (
          <EmptyState onCreateGroup={() => setShowCreateModal(true)} />
        )}

        {/* Groups Grid */}
        {!isLoading && !error && filteredGroups.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                isUserInGroup={isUserInGroup(group)}
                status={getGroupStatus(group)}
                onJoinGroup={handleJoinGroup}
                isJoining={joiningGroupId === group.id}
              />
            ))}
          </div>
        )}

        {/* Create Group Modal */}
        <CreateGroupModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateGroup={handleCreateGroup}
        />
      </div>
    </div>
  );
};

// Mock data for development
const getMockGroups = () => [
  {
    id: '1',
    name: 'Morning Runners',
    description: 'Join us for energizing morning runs through the park. All fitness levels welcome!',
    activity: 'Running',
    category: 'Physical',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800',
    memberCount: 24,
    capacity: 30,
    members: [],
    createdAt: '2024-01-15T08:00:00Z',
    status: 'active',
  },
  {
    id: '2',
    name: 'Book Lovers Club',
    description: 'Monthly meetups to discuss our favorite reads and discover new books.',
    activity: 'Book Club',
    category: 'Social',
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800',
    memberCount: 15,
    capacity: 20,
    members: [],
    createdAt: '2024-01-10T10:00:00Z',
    status: 'active',
  },
  {
    id: '3',
    name: 'Mindful Meditation',
    description: 'Daily meditation sessions to cultivate inner peace and mindfulness.',
    activity: 'Meditation',
    category: 'Wellness',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    memberCount: 18,
    capacity: 25,
    members: [],
    createdAt: '2024-01-20T06:00:00Z',
    status: 'active',
  },
  {
    id: '4',
    name: 'Weekend Hikers',
    description: 'Explore beautiful trails and connect with nature every weekend.',
    activity: 'Hiking',
    category: 'Physical',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
    memberCount: 30,
    capacity: 30,
    members: [],
    createdAt: '2024-01-05T09:00:00Z',
    status: 'active',
  },
  {
    id: '5',
    name: 'Recovery Support',
    description: 'A safe space for those on their recovery journey. Confidential and supportive.',
    activity: 'Mental Health Support',
    category: 'Support',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800',
    memberCount: 12,
    capacity: 15,
    members: [],
    createdAt: '2024-01-18T18:00:00Z',
    status: 'active',
  },
  {
    id: '6',
    name: 'Yoga Flow',
    description: 'Gentle yoga sessions for all levels. Focus on flexibility and breathing.',
    activity: 'Yoga',
    category: 'Wellness',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    memberCount: 22,
    capacity: 25,
    members: [],
    createdAt: '2024-01-12T07:00:00Z',
    status: 'active',
  },
];

export default Groups;
