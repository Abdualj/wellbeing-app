import ShareModal from '../components/Community/ShareModal';
import useUserProfile from '../Hooks/useUserProfile';
import { useState, useEffect} from 'react';
import TimeAgo from 'react-timeago';
import { CommentInput, CommentDisplay } from '../components/Community/Comments';
import Post from '../components/Community/Post';
import { fileToBase64 } from '../utils/mediaCompression';

const Community = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const [showShare, setShowShare] = useState(false);
  const [activeTab, setActiveTab] = useState('public');
  const [openPostMenu, setOpenPostMenu] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [openCommentId, setOpenCommentId] = useState(null);
  const [openComments, setOpenComments] = useState({});
  const { user, groups, loading } = useUserProfile();
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const getToken = () => localStorage.getItem('token');

//Haetaan julkaisut
  const fetchPost = async () => {
    try {
      setPostsLoading(true);
      // Valitaan endpoint riippuen feedistä (AI avustettu)
      const endpoint =
        activeTab === 'public'
          ? `${API_URL}/api/v1/posts/public-feed`
          : `${API_URL}/api/v1/posts/group-feed`;

      const token = getToken();

      if (activeTab === 'community' && !token) {
        setPosts([]);
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        ...(token && activeTab === 'community'
          ? { Authorization: `Bearer ${token}` }
          : {}),
      };

      const res = await fetch(endpoint, {
        method: 'GET',
        headers,
      });

      if (!res.ok) {
        setPosts([]);
        return;
      }

      const data = await res.json();
      const allPosts = data.data || [];
      // Järjestetään julkaisut uusimmasta vanhimpaan
      allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setPosts(allPosts);
    } catch (error) {
      console.error('Fetch error:', error);
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };
    //luodaan uusi julkaisu
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

        // Convert files to base64
        const attachments = [];
        
        try {
          if (data.imageFile) {
            console.log('Converting image to base64...');
            // Allow up to 50MB for compressed images
            const imageBase64 = await fileToBase64(data.imageFile, 50);
            attachments.push(imageBase64);
            console.log('Image converted successfully');
          }
          
          if (data.videoFile) {
            console.log('Converting video to base64...');
            // Allow up to 50MB for videos
            const videoBase64 = await fileToBase64(data.videoFile, 50);
            attachments.push(videoBase64);
            console.log('Video converted successfully');
          }
        } catch (fileError) {
          console.error('File conversion error:', fileError);
          alert(fileError.message || 'Failed to process file. File might be too large.');
          return;
        }

        // Endpointin valinta
        const endpoint = data.group && data.visibility === 'GROUP'
          ? `${API_URL}/api/v1/posts/groups/${data.group}/posts`
          : `${API_URL}/api/v1/posts/public`;

        const postData = {
          content: data.content,
          visibility: data.visibility,
        };
        
        if (attachments.length > 0) {
          postData.attachments = attachments;
        }
        
        if (data.group) {
          postData.groupId = data.group;
        }

        console.log('Sending post data:', { ...postData, attachments: postData.attachments ? `[${postData.attachments.length} files]` : 'none' });

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData),
        });

        if (!res.ok) {
          const error = await res.json();
          console.error('Post creation failed:', error);
          throw new Error(error.message || 'Failed to create post');
        }

        const result = await res.json();
        console.log('Post created successfully:', result);

        setShowShare(false);
        await fetchPost();
      } catch (error) {
        console.error('Error creating post:', error);
        alert(`Failed to create post: ${error.message}`);
      }
  };

  //Käsittelee tykkäykset
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
        `${API_URL}/api/v1/posts/${postId}/like`,
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

  //julkaisun poistaminen
  const handleDelete = async (postId) => {
    try {
      const token = getToken();
      if (!token) {
        alert('No token found');
        return;
      }

      const res = await fetch(
        `${API_URL}/api/v1/posts/${postId}`,
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

  //kommentin lisääminen
  const handleAddComment = async (postId, text, parentId = null) => {
    const token = getToken();
    if (!token) return;
    await fetch(`${API_URL}/api/v1/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: text, parentId }),
    });
    fetchPost();
  };
  //kommentin poistaminen
  const handleDeleteComment = async (commentId) => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/posts/comments/${commentId}`, {
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
  //Haetaan julkaisut tabin vaihtuessa
  useEffect(() => {
    fetchPost();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">

        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-sage-900">Community</h1>
          {user && (
            <button
              onClick={() => setShowShare(true)}
              className="px-3 sm:px-5 py-2 bg-sage-900 text-white rounded-full hover:bg-gray-800 transition text-xs sm:text-sm font-medium shadow-sm hover:shadow-md"
            >
              New post
            </button>
          )}
        </div>

        <div className="mb-4 sm:mb-6">
          <div className='border-border h-12 sm:h-14 grid grid-cols-2 text-sage-900'>
            <button
              onClick={() => setActiveTab('public')}
              className="relative flex items-center justify-center font-semibold text-sm sm:text-base"
            >
              Public Feed
              {activeTab === 'public' && (
                <span className="absolute bottom-0 h-[2px] w-1/2 bg-sage-900 rounded-full"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className="relative flex items-center justify-center font-semibold text-sm sm:text-base"
            >
              Group Feed
              {activeTab === 'community' && (
                <span className="absolute bottom-0 h-[2px] w-1/2 bg-sage-900 rounded-full"></span>
              )}
            </button>
          </div>
        </div>

        <div>
          {postsLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading posts...</p>
            </div>
          ) : !user ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-sage-900 mb-2 sm:mb-3">
                  Welcome to WellSpring Community
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                  {activeTab === 'public' 
                    ? 'Join our community to see public posts, share your wellness journey, and connect with others.'
                    : 'Log in to see posts from your groups and engage with your community members.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <a 
                    href="/login" 
                    className="px-6 py-3 bg-sage-700 text-white rounded-lg font-medium hover:bg-sage-800 transition active:scale-95 text-sm sm:text-base"
                  >
                    Log In
                  </a>
                  <a 
                    href="/register" 
                    className="px-6 py-3 border-2 border-sage-700 text-sage-700 rounded-lg font-medium hover:bg-sage-50 transition active:scale-95 text-sm sm:text-base"
                  >
                    Create Account
                  </a>
                </div>
              </div>
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
              <Post
                key={post.id}
                post={post}
                user={user}
                likedPosts={likedPosts}
                openPostMenu={openPostMenu}
                setOpenPostMenu={setOpenPostMenu}
                handleDelete={handleDelete}
                handleLikePost={handleLikePost}
                openComments={openComments}
                setOpenComments={setOpenComments}
                CommentInput={CommentInput}
                CommentDisplay={CommentDisplay}
                handleAddComment={handleAddComment}
              />
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