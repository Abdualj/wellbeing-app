import { X } from 'lucide-react';

const ShareModal = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-sage-900">Share Your Journey</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user?.firstName}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-sage-200 flex items-center justify-center flex-shrink-0 text-sage-700 font-semibold">
                {user?.firstName?.[0] || 'U'}
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-sage-900">{user?.firstName ? `${user.firstName} ${user.lastName}` : 'Guest User'}</p>
              <select className="mt-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-sage-500 focus:border-transparent bg-white">
                <option value="">Select a group</option>
              </select>
            </div>
          </div>

          <textarea
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-0 focus:border-gray-300 resize-none"
          />

          <div className="bg-sage-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium text-sage-900">Share to:</p>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition active:scale-95">
                  Public Feed
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition active:scale-95">
                  Community Feed
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition active:scale-95"
            >
              Cancel
            </button>
            <button className="px-6 py-2.5 bg-sage-300 text-sage-900 rounded-md hover:bg-sage-400 transition active:scale-95">
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;