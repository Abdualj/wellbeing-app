import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import '../src/App.css'
import Login from './views/Login'
import Register from './views/Register'
import Profile from './views/Profile'
import Community from './views/Community'
import Groups from './views/Groups'
import GroupChat from './views/GroupChat'
import Chats from './views/Chats'
import Header from './components/Header'
import LoadingScreen from './components/LoadingScreen'
import Toast from './components/Toast'
import GlobalNotifications from './components/GlobalNotifications'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import ProtectedRoutes from './components/ProtectedRoutes';


// Development mode: Set dev-user-id if no userId exists
if (!localStorage.getItem('userId')) {
  localStorage.setItem('userId', 'dev-user-id');
  console.log('🔧 Development mode: Using dev-user-id');
}

const AppWrapper = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { toast, hideToast } = useApp();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {loading && <LoadingScreen />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <GlobalNotifications />
      <Header />
      <Routes>
        <Route path="/community" element={<Community />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<ProtectedRoutes><Profile /></ProtectedRoutes>} />
        <Route path="/register" element={<Register />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/chats" element={<ProtectedRoutes><Chats /></ProtectedRoutes>} />
        <Route path="/groups/:groupId/chat" element={<ProtectedRoutes><GroupChat /></ProtectedRoutes>} />
      </Routes>
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <BrowserRouter>
        <AppWrapper />
      </BrowserRouter>
    </AppProvider>
  </React.StrictMode>,
)
