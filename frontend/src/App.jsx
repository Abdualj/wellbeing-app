import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:3000/api/v1';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [groups, setGroups] = useState([]);
  const [posts, setPosts] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newPost, setNewPost] = useState('');

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.data);
      } else {
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        const accessToken = data.data.accessToken;
        setToken(accessToken);
        localStorage.setItem('token', accessToken);
        setUser(data.data.user);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (testEmail) => {
    setEmail(testEmail);
    setPassword('Password123!');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setGroups([]);
    setPosts([]);
    setSelectedGroup(null);
  };

  const createGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDesc,
          maxMembers: 10,
          isPrivate: true
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setGroups([...groups, data.data]);
        setNewGroupName('');
        setNewGroupDesc('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupPosts = async (groupId) => {
    try {
      const res = await fetch(`${API_URL}/groups/${groupId}/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setPosts(data.data || []);
        setSelectedGroup(groupId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const createPost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || !selectedGroup) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/groups/${selectedGroup}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: newPost })
      });
      
      if (res.ok) {
        const data = await res.json();
        setPosts([data.data, ...posts]);
        setNewPost('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="app">
        <div className="header">
          <h1>Wellbeing Community</h1>
          <p>Connect with small groups for mental wellness</p>
        </div>
        
        <div className="login-card">
          <h2>Login</h2>
          {error && <div className="error">{error}</div>}
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="test-users">
            <h4>Quick Test Login:</h4>
            <button onClick={() => quickLogin('alice@example.com')}>
              Alice Anderson
            </button>
            <button onClick={() => quickLogin('bob@example.com')}>
              Bob Baker
            </button>
            <button onClick={() => quickLogin('carol@example.com')}>
              Carol Chen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <h1>Wellbeing Community</h1>
        <p>Your safe space for connection</p>
      </div>
      
      <div className="dashboard">
        <div className="card user-info">
          <h2>Welcome, {user?.firstName}!</h2>
          <p>{user?.email}</p>
          <p>Notification Preference: {user?.notificationPreference}</p>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
        
        <div className="card">
          <h3>📁 Create Group</h3>
          <form onSubmit={createGroup} className="group-form">
            <input
              type="text"
              placeholder="Group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Description"
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
            />
            <button type="submit" className="btn-small" disabled={loading}>
              Create Group
            </button>
          </form>
          
          <div style={{ marginTop: 20 }}>
            <h4 style={{ marginBottom: 12, color: '#666' }}>Your Groups:</h4>
            {groups.length === 0 ? (
              <p className="empty-state">No groups yet. Create one!</p>
            ) : (
              groups.map(group => (
                <div key={group.id} className="group-item">
                  <h4>{group.name}</h4>
                  <p>{group.description}</p>
                  <button
                    onClick={() => loadGroupPosts(group.id)}
                    className="btn-small"
                    style={{ marginTop: 8 }}
                  >
                    View Posts
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="card">
          <h3>💬 {selectedGroup ? 'Group Posts' : 'Select a Group'}</h3>
          
          {selectedGroup && (
            <>
              <form onSubmit={createPost} className="post-form">
                <textarea
                  placeholder="Share something with your group..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                />
                <button type="submit" className="btn-small" disabled={loading}>
                  Post
                </button>
              </form>
              
              <div style={{ marginTop: 20 }}>
                {posts.length === 0 ? (
                  <p className="empty-state">No posts yet. Be the first!</p>
                ) : (
                  posts.map(post => (
                    <div key={post.id} className="post-item">
                      <h4>{post.author.displayName}</h4>
                      <p>{post.content}</p>
                      <div className="post-meta">
                        {new Date(post.createdAt).toLocaleDateString()} • 
                        {post._count?.comments || 0} comments
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
          
          {!selectedGroup && (
            <p className="empty-state">
              Select a group to view and create posts
            </p>
          )}
        </div>
        
        <div className="card">
          <h3>✨ Features Showcase</h3>
          <ul style={{ paddingLeft: 20, color: '#666', lineHeight: 1.8 }}>
            <li>✅ JWT Authentication</li>
            <li>✅ User Profiles</li>
            <li>✅ Small Group Creation (4-12 members)</li>
            <li>✅ Private Group Posts</li>
            <li>✅ Event Management</li>
            <li>✅ GDPR Compliance</li>
            <li>✅ Notification Preferences</li>
            <li>✅ Role-Based Access</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
