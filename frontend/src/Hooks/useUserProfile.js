import { useState, useEffect } from 'react';

const useUserProfile = () => {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/v1/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const info = await res.json();
      setUser(info.data);
    } catch (error) {
      console.log('error', error);
    }
  };

  const fetchGroup = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/v1/users/groups', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const info = await res.json();
      setGroups(info.data);
    } catch (error) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchGroup();
  }, []);

  const refetch = () => {
    fetchUser();
    fetchGroup();
  };

  return { user, groups, refetch };
};

export default useUserProfile;