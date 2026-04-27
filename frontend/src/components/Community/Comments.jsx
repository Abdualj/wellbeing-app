import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';

const CommentInput = ({ postId, onSubmit, placeholder = "Add a comment..." }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    try {
      await onSubmit(text);
      setText('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-sage-900 font-inherit"
      />
      <button 
        onClick={handleSubmit} 
        disabled={loading || !text.trim()}
        className="px-4 py-2 bg-sage-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Posting...' : 'Post'}
      </button>
    </div>
  );
};

const CommentDisplay = ({ 
  comment, 
  postId,
  onAddReply,
  onDelete,
  user
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleReply = async (text) => {
    await onAddReply(postId, text, comment.id);
    setShowReplyForm(false);
  };

  const handleDelete = async () => {
    await onDelete(comment.id);
    setShowMenu(false);
  };

  const formatTimestamp = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now - commentDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffHours < 1) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return commentDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  if (!comment || !comment.author) {
    return null;
  }

  const isAuthor = user?.id === comment.author.id;

  return (
    <div className="mt-3 pb-3 border-b border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {comment.author?.avatar ? (
            <img
              src={comment.author.avatar}
              alt=""
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">
              {comment.author?.firstName?.[0] || 'U'}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-1 mb-1">
              <span className="font-semibold text-sage-900 text-sm">
                {comment.author?.firstName} {comment.author?.lastName}
              </span>
              <span className="text-gray-400 text-xs">·</span>
              <span className="text-gray-400 text-xs">
                {formatTimestamp(comment.createdAt)}
              </span>
            </div>

            <p className="text-gray-800 text-sm mb-2">{comment.content}</p>

            <button 
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-xs text-gray-500 hover:text-gray-700 transition"
            >
              {showReplyForm ? 'Cancel' : 'Reply'}
            </button>

            {showReplyForm && (
              <div className="mt-3">
                <CommentInput 
                  postId={postId}
                  onSubmit={handleReply}
                  placeholder="Write a reply..."
                />
              </div>
            )}
          </div>
        </div>

        {isAuthor && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-gray-600"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <button
                  onClick={handleDelete}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export { CommentInput, CommentDisplay };