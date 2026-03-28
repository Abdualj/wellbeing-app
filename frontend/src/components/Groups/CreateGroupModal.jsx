import { useState } from 'react';
import { X, Users, MapPin, Calendar } from 'lucide-react';

const CreateGroupModal = ({ isOpen, onClose, onCreateGroup }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    activity: '',
    category: '',
    capacity: 20,
    location: '',
    meetingSchedule: '',
    imageUrl: '',
    privacy: 'public',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const activityOptions = [
    { value: 'Running', category: 'Physical' },
    { value: 'Soccer', category: 'Physical' },
    { value: 'Cycling', category: 'Physical' },
    { value: 'Swimming', category: 'Physical' },
    { value: 'Yoga', category: 'Wellness' },
    { value: 'Hiking', category: 'Physical' },
    { value: 'Walking Challenge', category: 'Physical' },
    { value: 'Wine Tasting', category: 'Social' },
    { value: 'Book Club', category: 'Social' },
    { value: 'Cooking', category: 'Social' },
    { value: 'Photography', category: 'Social' },
    { value: 'Meditation', category: 'Wellness' },
    { value: 'Breathwork', category: 'Wellness' },
    { value: 'Mental Health Support', category: 'Support' },
    { value: 'AA', category: 'Support' },
    { value: 'NA', category: 'Support' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Auto-set category when activity is selected
    if (name === 'activity') {
      const activity = activityOptions.find(opt => opt.value === value);
      if (activity) {
        setFormData(prev => ({
          ...prev,
          category: activity.category,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onCreateGroup(formData);
      // Reset form
      setFormData({
        name: '',
        description: '',
        activity: '',
        category: '',
        capacity: 20,
        location: '',
        meetingSchedule: '',
        imageUrl: '',
        privacy: 'public',
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-sage-900">Create New Group</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
              {error}
            </div>
          )}

          {/* Group Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-sage-900 mb-2">
              Group Name *
            </label>
            <input            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            placeholder="e.g., Morning Runners"
          />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-sage-900 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
            placeholder="Describe your group's purpose and what members can expect..."
          />
          </div>

          {/* Activity & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="activity" className="block text-sm font-medium text-sage-900 mb-2">
                Activity Type *
              </label>
              <select
                id="activity"
                name="activity"
                value={formData.activity}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              >
                <option value="">Select an activity</option>
                {activityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-sage-900 mb-2">
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                readOnly
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                placeholder="Auto-selected"
              />
            </div>
          </div>

          {/* Capacity & Privacy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-sage-900 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Group Capacity *
              </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                required
                min="5"
                max="100"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="privacy" className="block text-sm font-medium text-sage-900 mb-2">
                Privacy
              </label>
              <select
                id="privacy"
                name="privacy"
                value={formData.privacy}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-sage-900 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              placeholder="e.g., Central Park, New York"
            />
          </div>

          {/* Meeting Schedule */}
          <div>
            <label htmlFor="meetingSchedule" className="block text-sm font-medium text-sage-900 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Meeting Schedule
            </label>
            <input
              type="text"
              id="meetingSchedule"
              name="meetingSchedule"
              value={formData.meetingSchedule}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              placeholder="e.g., Every Monday at 6 PM"
            />
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-sage-900 mb-2">
              Cover Image URL
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
            {formData.imageUrl && (
              <div className="mt-2">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-md"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-sage-900 text-white rounded-md hover:bg-sage-800 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
