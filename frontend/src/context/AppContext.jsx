import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
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
  
  // Prevent multiple simultaneous fetches
  const fetchInProgressRef = useRef(false);

  // Debug: Log whenever groups state changes
  useEffect(() => {
    console.log('[AppContext] 🔔 Groups state changed!');
    console.log('[AppContext] 🔔 Current groups count:', groups.length);
    console.log('[AppContext] 🔔 Current groups:', JSON.stringify(groups, null, 2));
  }, [groups]);

  const fetchUserProfile = useCallback(async () => {
    try {
      console.log('[AppContext] 🔄 Fetching user profile...');
      const response = await usersAPI.getProfile();
      console.log('[AppContext] ✅ User profile fetched successfully');
      setUser(response.data);
      setProfileError(null);
    } catch (error) {
      console.error('[AppContext] ❌ Error fetching user profile:', error);
      setProfileError(error.message);
    }
  }, []);

  const fetchUserGroups = useCallback(async () => {
    try {
      console.log('[AppContext] 🔄 Fetching user groups...');
      const response = await usersAPI.getUserGroups();
      console.log('[AppContext] ✅ RAW API Response:', response);
      console.log('[AppContext] ✅ User groups fetched:', response.data?.length || 0, 'groups');
      console.log('[AppContext] 📊 Groups data:', JSON.stringify(response.data, null, 2));
      
      // Log each group's role for debugging
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach(group => {
          console.log(`[AppContext] 👥 Group "${group.name}" - Role: ${group.role}, ID: ${group.id}`);
        });
      }
      
      // Force a new array reference to trigger re-render
      const newGroups = Array.isArray(response.data) ? [...response.data] : [];
      console.log('[AppContext] 🔄 Setting groups state with', newGroups.length, 'groups');
      console.log('[AppContext] 🔄 New groups array:', newGroups);
      
      setGroups(prevGroups => {
        console.log('[AppContext] 📝 Previous groups state:', prevGroups.length, 'groups');
        console.log('[AppContext] 📝 New groups state:', newGroups.length, 'groups');
        console.log('[AppContext] 📝 Groups changed:', JSON.stringify(prevGroups) !== JSON.stringify(newGroups));
        return newGroups;
      });
      
      setProfileError(null);
      
      // Log after state update is queued
      console.log('[AppContext] ✅ Groups state update queued');
    } catch (error) {
      console.error('[AppContext] ❌ Error fetching user groups:', error);
      setProfileError(error.message);
      setGroups([]); // Clear groups on error
    }
  }, []);

  const refetchProfile = useCallback(async () => {
    console.log('[AppContext] 🔄 Manual refetch triggered');
    fetchInProgressRef.current = true;
    setProfileLoading(true);
    await Promise.all([fetchUserProfile(), fetchUserGroups()]);
    setProfileLoading(false);
    fetchInProgressRef.current = false;
    console.log('[AppContext] ✅ Manual refetch complete');
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
      console.log('[AppContext] ⚠️ No token found, skipping profile fetch');
      setProfileLoading(false);
      return;
    }

    // Prevent duplicate fetch on mount
    if (fetchInProgressRef.current) {
      console.log('[AppContext] ⚠️ Fetch already in progress, skipping mount fetch');
      return;
    }

    console.log('[AppContext] 🚀 Initial profile load triggered (on mount)');
    const loadProfile = async () => {
      fetchInProgressRef.current = true;
      setProfileLoading(true);
      await Promise.all([fetchUserProfile(), fetchUserGroups()]);
      setProfileLoading(false);
      fetchInProgressRef.current = false;
      console.log('[AppContext] ✅ Initial profile load complete');
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
      console.log('[AppContext] 🔄 Profile refresh requested (count:', shouldRefreshProfile, ')');
      
      // Wait for any in-progress fetch to complete, then fetch
      const refreshProfile = async () => {
        // Wait if already fetching
        let attempts = 0;
        while (fetchInProgressRef.current && attempts < 10) {
          console.log('[AppContext] ⏳ Waiting for in-progress fetch... (attempt', attempts + 1, '/10)');
          await new Promise(resolve => setTimeout(resolve, 300));
          attempts++;
        }
        
        if (attempts >= 10) {
          console.warn('[AppContext] ⚠️ Timeout waiting for fetch to complete, proceeding anyway');
        }
        
        fetchInProgressRef.current = true;
        setProfileLoading(true);
        await Promise.all([fetchUserProfile(), fetchUserGroups()]);
        setProfileLoading(false);
        fetchInProgressRef.current = false;
        console.log('[AppContext] ✅ Profile refresh complete');
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
