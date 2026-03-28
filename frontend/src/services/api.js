// API Service for Wellbeing App
const API_BASE_URL = 'http://localhost:3000/api/v1';

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
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
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
    
    const url = `${API_BASE_URL}/groups${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // Get a single group by ID
  getById: async (groupId) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // Create a new group
  create: async (groupData) => {
    const response = await fetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(groupData),
    });
    
    return handleResponse(response);
  },

  // Update a group
  update: async (groupId, groupData) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(groupData),
    });
    
    return handleResponse(response);
  },

  // Delete a group
  delete: async (groupId) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // Join a group
  join: async (groupId) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/join`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // Leave a group
  leave: async (groupId) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/leave`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // Get group members
  getMembers: async (groupId) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members`, {
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
    
    const url = `${API_BASE_URL}/posts${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  create: async (postData) => {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(postData),
    });
    
    return handleResponse(response);
  },

  delete: async (postId) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
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
    
    const url = `${API_BASE_URL}/events${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  create: async (eventData) => {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData),
    });
    
    return handleResponse(response);
  },

  rsvp: async (eventId, status) => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/rsvp`, {
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
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    return handleResponse(response);
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
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
  getProfile: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  updateProfile: async (userId, userData) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
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
};
