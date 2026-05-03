import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import TimeAgo from 'react-timeago';

//näyttää julkaisun community-sivulla
const Post = ({
  post,
  user,
  likedPosts,
  openPostMenu,
  setOpenPostMenu,
  handleDelete,
  handleLikePost,
  openComments,
  setOpenComments,
  CommentInput,
  CommentDisplay,
  handleAddComment
}) => {
  return (
    <div className="px-3 sm:px-4 py-3 sm:py-4 flex gap-2 sm:gap-3 border-b border-gray-200 bg-white">
      <div className="flex-shrink-0">
        {post.author?.avatar ? (
          <img
            src={post.author.avatar}
            alt=""
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs sm:text-sm font-medium text-gray-600">
            {post.author?.firstName?.[0] || 'U'}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="flex flex-wrap items-center gap-1 text-xs sm:text-sm min-w-0">
            <span className="font-semibold text-sage-900 truncate">
              {post.author?.firstName} {post.author?.lastName}
            </span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-400 text-xs sm:text-sm">
              <TimeAgo date={post.createdAt} />
            </span>
            {post.group?.name && (
              <>
                <span className="text-gray-400 hidden sm:inline">·</span>
                <span className="text-gray-400 text-xs truncate max-w-[100px] sm:max-w-none">{post.group.name}</span>
              </>
            )}
          </div>

          {post.author?.id === user?.id && (
            <div className="relative">
              <button
                onClick={() =>
                  setOpenPostMenu(openPostMenu === post.id ? null : post.id)
                }
                className="text-gray-400 hover:text-gray-600"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {openPostMenu === post.id && (
                <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <button
                    onClick={() => {
                      handleDelete(post.id);
                      setOpenPostMenu(null);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {post.content && (
          <p className="text-gray-800 text-xs sm:text-sm my-2 leading-relaxed break-words">
            {post.content}
          </p>
        )}

        {post.attachments && post.attachments.length > 0 && (
          <div className="mb-2 sm:mb-3">
            {post.attachments.map((attachment, index) => {
              if (attachment.startsWith('data:image/')) {
                return (
                  <img
                    key={index}
                    src={attachment}
                    alt=""
                    className="rounded-lg sm:rounded-xl w-full max-h-64 sm:max-h-96 object-cover"
                  />
                );
              } else if (attachment.startsWith('data:video/')) {
                return (
                  <video
                    key={index}
                    src={attachment}
                    controls
                    className="rounded-lg sm:rounded-xl w-full max-h-64 sm:max-h-96"
                  />
                );
              }
              return null;
            })}
          </div>
        )}

        <div className="flex items-center gap-4 sm:gap-6 pt-2">
          <button
            onClick={() => handleLikePost(post.id)}
            className="flex items-center gap-1.5 sm:gap-2 transition hover:scale-105"
          >
            <Heart
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                likedPosts[post.id]
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-500 hover:text-red-500'
              }`}
            />
            <span className="text-xs sm:text-sm text-gray-600">
              {post._count?.likes || 0}
            </span>
          </button>

          <button
            onClick={() =>
              setOpenComments((prev) => ({
                ...prev,
                [post.id]: !prev[post.id],
              }))
            }
            className="flex items-center gap-1.5 sm:gap-2 text-gray-500 hover:text-gray-700 transition hover:scale-105"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm">
              {post._count?.comments || 0}
            </span>
          </button>
        </div>

        {openComments[post.id] && (
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100 space-y-2 sm:space-y-3">
            <CommentInput
              postId={post.id}
              onSubmit={(text) => handleAddComment(post.id, text)}
            />

            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <CommentDisplay
                    comment={comment}
                    postId={post.id}
                    onAddReply={handleAddComment}
                    onDelete={() => {}}
                    user={user}
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-xs sm:text-sm text-center py-3 sm:py-4">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Post;