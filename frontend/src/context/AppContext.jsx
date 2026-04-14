import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { usersAPI } from '../services/api';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [shouldRefreshProfile, setShouldRefreshProfile] = useState(0);
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await usersAPI.getProfile();
      setUser(response.data);
      setProfileError(null);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfileError(error.message);
    }
  }, []);

  const fetchUserGroups = useCallback(async () => {
    try {
      const response = await usersAPI.getUserGroups();
      setGroups(response.data || []);
      setProfileError(null);
    } catch (error) {
      console.error('Error fetching user groups:', error);
      setProfileError(error.message);
    }
  }, []);

  const refetchProfile = useCallback(async () => {
    setProfileLoading(true);
    await Promise.all([fetchUserProfile(), fetchUserGroups()]);
    setProfileLoading(false);
  }, [fetchUserProfile, fetchUserGroups]);

  // Trigger profile refresh when user joins/creates a group
  const triggerProfileRefresh = useCallback(() => {
    setShouldRefreshProfile(prev => prev + 1);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Fetch profile data on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Only fetch if user is authenticated
    if (!token) {
      setProfileLoading(false);
      return;
    }

    const loadProfile = async () => {
      setProfileLoading(true);
      await Promise.all([fetchUserProfile(), fetchUserGroups()]);
      setProfileLoading(false);
    };
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Refetch when shouldRefreshProfile changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Only refetch if user is authenticated
    if (!token || shouldRefreshProfile === 0) {
      return;
    }

    if (shouldRefreshProfile > 0) {
      const refreshProfile = async () => {
        setProfileLoading(true);
        await Promise.all([fetchUserProfile(), fetchUserGroups()]);
        setProfileLoading(false);
      };
      refreshProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRefreshProfile]); // Only depend on the counter, not the functions

  const value = {
    shouldRefreshProfile,
    triggerProfileRefresh,
    user,
    groups,
    profileLoading,
    profileError,
    refetchProfile,
    toast,
    showToast,
    hideToast,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
