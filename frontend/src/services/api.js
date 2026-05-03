// API Service for Wellbeing App
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch (err) {
    // If response is not JSON, try to get text
    const text = await response.text();
    throw new Error(text || 'An error occurred');
  }
  
  if (!response.ok) {
    throw new Error(data.message || data.error || 'An error occurred');
  }
  
  return data;
};

// Groups API
export const groupsAPI = {
  // Get all groups with optional filters
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.activity) queryParams.append('activity', params.activity);
    if (params.category) queryParams.append('category', params.category);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const url = `${API_BASE_URL}/api/v1/groups${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // Get a single group by ID
  getById: async (groupId) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/groups/${groupId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // Create a new group
  create: async (groupData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/groups`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(groupData),
    });
    
    return handleResponse(response);
  },

  // Update a group
  update: async (groupId, groupData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/groups/${groupId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(groupData),
    });
    
    return handleResponse(response);
  },

  // Delete a group
  delete: async (groupId) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/groups/${groupId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // Join a group
  join: async (groupId) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/groups/${groupId}/join`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // Leave a group
  leave: async (groupId) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/groups/${groupId}/leave`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // Get group members
  getMembers: async (groupId) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/groups/${groupId}/members`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },
};

// Posts API
export const postsAPI = {
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.groupId) queryParams.append('groupId', params.groupId);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const url = `${API_BASE_URL}/api/v1/posts${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  create: async (postData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/posts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(postData),
    });
    
    return handleResponse(response);
  },

  delete: async (postId) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/posts/${postId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },
};

// Events API
export const eventsAPI = {
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.groupId) queryParams.append('groupId', params.groupId);
    if (params.upcoming) queryParams.append('upcoming', params.upcoming);
    
    const url = `${API_BASE_URL}/api/v1/events${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  create: async (eventData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/events`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData),
    });
    
    return handleResponse(response);
  },

  rsvp: async (eventId, status) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/events/${eventId}/rsvp`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    return handleResponse(response);
  },
};

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    return handleResponse(response);
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    return handleResponse(response);
  },

  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  },
};

// Users API
export const usersAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  updateProfile: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    
    return handleResponse(response);
  },

  getUserGroups: async () => {
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    const response = await fetch(`${API_BASE_URL}/api/v1/users/groups?_t=${timestamp}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store', // Disable caching
    });
    
    return handleResponse(response);
  },

  getUserStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },
};

// Debug API (only available in development)
export const debugAPI = {
  getMemberships: async () => {
    const response = await fetch(`${API_BASE_URL}/debug/memberships`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },
};

// Messages API
export const messagesAPI = {
  // Send a message to a group
  send: async (groupId, content) => {
    const response = await fetch(`${API_BASE_URL}/messages/groups/${groupId}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    
    return handleResponse(response);
  },

  // Get messages for a group
  getGroupMessages: async (groupId, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.before) queryParams.append('before', params.before);
    
    const response = await fetch(
      `${API_BASE_URL}/messages/groups/${groupId}/messages?${queryParams}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );
    
    return handleResponse(response);
  },

  // Edit a message
  edit: async (messageId, content) => {
    const response = await fetch(`${API_BASE_URL}/messages/messages/${messageId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    
    return handleResponse(response);
  },

  // Delete a message
  delete: async (messageId) => {
    const response = await fetch(`${API_BASE_URL}/messages/messages/${messageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // Mark message as read
  markAsRead: async (messageId) => {
    const response = await fetch(`${API_BASE_URL}/messages/messages/${messageId}/read`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // Mark all messages in a group as read
  markAllAsRead: async (groupId) => {
    const response = await fetch(`${API_BASE_URL}/messages/groups/${groupId}/mark-all-read`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // Get unread count for a group
  getUnreadCount: async (groupId) => {
    const response = await fetch(`${API_BASE_URL}/messages/groups/${groupId}/unread-count`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // Get unread counts for all groups
  getUnreadCounts: async () => {
    const response = await fetch(`${API_BASE_URL}/messages/unread-counts`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },
};

export default {
  groups: groupsAPI,
  posts: postsAPI,
  events: eventsAPI,
  auth: authAPI,
  users: usersAPI,
  messages: messagesAPI,
};
