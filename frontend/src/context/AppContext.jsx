import { createContext, useContext, useState, useCallback } from 'react';

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

  // Trigger profile refresh when user joins/creates a group
  const triggerProfileRefresh = useCallback(() => {
    setShouldRefreshProfile(prev => prev + 1);
  }, []);

  const value = {
    shouldRefreshProfile,
    triggerProfileRefresh,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
