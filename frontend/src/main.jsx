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
import PWAInstallPrompt from './components/PWAInstallPrompt'
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
      <PWAInstallPrompt />
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

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('✅ PWA Service Worker registered successfully:', registration.scope);
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour
      },
      (error) => {
        console.log('❌ PWA Service Worker registration failed:', error);
      }
    );
  });
}

// Listen for app updates
let refreshing = false;
navigator.serviceWorker?.addEventListener('controllerchange', () => {
  if (refreshing) return;
  refreshing = true;
  window.location.reload();
});

// Handle install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('💡 PWA can be installed');
  
  // You can show your custom install button here
  // Example: showInstallPromotion();
});

window.addEventListener('appinstalled', () => {
  console.log('✅ PWA was installed successfully');
  deferredPrompt = null;
});
