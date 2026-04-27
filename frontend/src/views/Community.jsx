import ShareModal from '../components/Community/ShareModal';
import useUserProfile from '../Hooks/useUserProfile';
import { Heart, MessageCircle, MoreHorizontal, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { CommentInput, CommentDisplay } from '../components/Community/Comments';

const Community = () => {
  const [showShare, setShowShare] = useState(false);
  const [activeTab, setActiveTab] = useState('public');
  const [showDropdown, setShowDropdown] = useState(false);
  const [openPostMenu, setOpenPostMenu] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [openComments, setOpenComments] = useState({});
  const dropdownRef = useRef(null);
  const { user } = useUserProfile();
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const getToken = () => localStorage.getItem('token');

  const formatTimeAgo = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const secondsAgo = Math.floor((now - postDate) / 1000);

    if (secondsAgo < 60) return 'just now';
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
    if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)}d ago`;

    return postDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchGroups = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch('http://localhost:3000/api/v1/users/groups', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        const groupsList = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        setGroups(groupsList);
      }
    } catch (error) {
      console.error('Error getting groups:', error);
    }
  };

  const fetchPost = async () => {
    try {
      setLoading(true);
      const token = getToken();

      if (!token) {
        console.error('No token found');
        return;
      }

      let endpoint = '';

      if (activeTab === 'public') {
        endpoint = 'http://localhost:3000/api/v1/posts/public-feed';
      } else if (activeTab === 'community') {
        endpoint = 'http://localhost:3000/api/v1/posts/group-feed';
      } else {
        return;
      }

      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!res.ok) {
        setPosts([]);
        return;
      }

      const data = await res.json();
      let allPosts = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

      allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setPosts(allPosts);
    } catch (error) {
      console.error('Fetch error:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (data) => {
    try {
      const token = getToken();
      if (!token) {
        alert('Please log in to create a post');
        return;
      }

      if (data.visibility === 'GROUP' && !data.group) {
        alert('Please select a group for community posts');
        return;
      }

      const endpoint = data.group && data.visibility === 'GROUP'
        ? `http://localhost:3000/api/v1/posts/groups/${data.group}/posts`
        : `http://localhost:3000/api/v1/posts/public`;

      let attachments = [];
      if (data.imageFile) {
        const base64 = await fileToBase64(data.imageFile);
        attachments.push(base64);
      }
      if (data.videoFile) {
        const base64 = await fileToBase64(data.videoFile);
        attachments.push(base64);
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: data.content,
          visibility: data.visibility,
          groupId: data.group || null,
          attachments: attachments,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create post');
      }

      setShowShare(false);
      await fetchPost();
    } catch (error) {
      console.error('Error creating post:', error);
      alert(`Failed to create post: ${error.message}`);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleLikePost = async (postId) => {
    try {
      const token = getToken();
      if (!token) {
        alert('Please log in to like posts');
        return;
      }

      setLikedPosts(prev => ({
        ...prev,
        [postId]: !prev[postId]
      }));

      const res = await fetch(
        `http://localhost:3000/api/v1/posts/${postId}/like`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!res.ok) {
        const error = await res.json();
        setLikedPosts(prev => ({
          ...prev,
          [postId]: !prev[postId]
        }));
        alert(error.message || 'Failed to like post');
        return;
      }

      await fetchPost();
    } catch (error) {
      console.error('Like error:', error);
      setLikedPosts(prev => ({
        ...prev,
        [postId]: !prev[postId]
      }));
    }
  };

  const handleDelete = async (postId) => {
    try {
      const token = getToken();
      if (!token) {
        alert('No token found');
        return;
      }

      const res = await fetch(
        `http://localhost:3000/api/v1/posts/${postId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!res.ok) {
        const error = await res.json();
        alert(`Delete failed: ${error.message}`);
        return;
      }

      setPosts((prev) => prev.filter((post) => post.id !== postId));
      setOpenPostMenu(null);
    } catch (error) {
      alert(`Delete error: ${error.message}`);
    }
  };

  const handleAddComment = async (postId, text, parentId = null) => {
    const token = getToken();
    if (!token) return;
    await fetch(`http://localhost:3000/api/v1/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: text, parentId }),
    });
    fetchPost();
  };

  const handleDeleteComment = async (commentId) => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:3000/api/v1/posts/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (res.ok) {
        setPosts(prevPosts => prevPosts.map(post => ({
          ...post,
          comments: post.comments?.filter(comment => comment.id !== commentId),
          _count: {
            ...post._count,
            comments: (post._count?.comments || 0) - 1
          }
        })));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    fetchPost();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-3xl mx-auto px-4 py-6">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-sage-900">Community</h1>
          <button
            onClick={() => setShowShare(true)}
            className="px-5 py-2 bg-sage-900 text-white rounded-full hover:bg-gray-800 transition text-sm font-medium shadow-sm hover:shadow-md"
          >
            New post
          </button>
        </div>

        <div className="flex justify-center mb-6">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition"
            >
              {activeTab === 'public' ? 'For you' : 'Following'}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden z-20">
                <button
                  onClick={() => {
                    setActiveTab('public');
                    setShowDropdown(false);
                  }}
                  className={`w-full text-center px-4 py-2 text-sm hover:bg-gray-50 transition ${activeTab === 'public' ? 'bg-gray-50 text-gray-900' : 'text-gray-600'
                    }`}
                >
                  For you
                </button>
                <button
                  onClick={() => {
                    setActiveTab('community');
                    setShowDropdown(false);
                  }}
                  className={`w-full text-center px-4 py-2 text-sm hover:bg-gray-50 transition ${activeTab === 'community' ? 'bg-gray-50 text-gray-900' : 'text-gray-600'
                    }`}
                >
                  Following
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">
                {activeTab === 'public'
                  ? 'No public posts yet. Be the first to share!'
                  : 'No group posts yet. Share something with your communities!'}
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    {post.author?.avatar ? (
                      <img
                        src={post.author.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">
                        {post.author?.firstName?.[0] || 'U'}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-sage-900 text-sm">
                          {post.author?.firstName} {post.author?.lastName}
                        </span>
                        <span className="text-gray-400 text-sm">·</span>
                        <span className="text-gray-400 text-sm">
                          {formatTimeAgo(post.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        {post.group?.name && (
                          <span className="text-gray-400 text-xs">
                            {post.group.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {post.author?.id === user?.id && (
                    <div className="relative">
                      <button
                        onClick={() => setOpenPostMenu(openPostMenu === post.id ? null : post.id)}
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

                <div className="mb-4">
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {post.content}
                  </p>
                </div>

                {post.attachments && post.attachments.length > 0 && (
                  <div className="mb-4">
                    {post.attachments.map((attachment, index) => {
                      if (attachment.startsWith('data:image/')) {
                        return (
                          <img
                            key={index}
                            src={attachment}
                            alt=""
                            className="rounded-2xl max-h-96 w-auto object-contain"
                          />
                        );
                      } else if (attachment.startsWith('data:video/')) {
                        return (
                          <video
                            key={index}
                            src={attachment}
                            controls
                            className="rounded-2xl max-h-96 w-auto"
                          />
                        );
                      }
                      return null;
                    })}
                  </div>
                )}

                <div className="flex items-center gap-6 pt-3 border-t border-gray-50">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className="flex items-center gap-2 transition hover:scale-105"
                  >
                    <Heart
                      className={`w-4 h-4 ${likedPosts[post.id] ? 'fill-red-500 text-red-500' : 'text-gray-500 hover:text-red-500'
                        }`}
                    />
                    <span className="text-sm text-gray-600">{post._count?.likes || 0}</span>
                  </button>

                  <button
                    onClick={() => setOpenComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition hover:scale-105"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">
                      {post._count?.comments || 0}
                    </span>
                  </button>
                </div>

                {openComments[post.id] && (
                  <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                    <CommentInput postId={post.id} onSubmit={(text) => handleAddComment(post.id, text)} />
                    {post.comments && post.comments.length > 0 ? (
                      post.comments.map((comment) => (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <CommentDisplay
                            key={comment.id}
                            comment={comment}
                            postId={post.id}
                            onAddReply={handleAddComment}
                            onDelete={handleDeleteComment}
                            user={user}
                          />
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm text-center py-4">No comments yet. Be the first to comment!</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        user={user}
        onSubmitPost={handleCreatePost}
        groups={groups}
      />
    </div>
  );
};

export default Community;