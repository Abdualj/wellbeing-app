import { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';

const useUserProfile = () => {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    try {
      const response = await usersAPI.getProfile();
      setUser(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError(error.message);
    }
  };

  const fetchGroup = async () => {
    try {
      const response = await usersAPI.getUserGroups();
      setGroups(response.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching user groups:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      await Promise.all([fetchUser(), fetchGroup()]);
      setLoading(false);
    };
    
    loadProfile();
  }, []);

  const refetch = async () => {
    setLoading(true);
    await Promise.all([fetchUser(), fetchGroup()]);
    setLoading(false);
  };

  return { user, groups, loading, error, refetch };
};

export default useUserProfile;