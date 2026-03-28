import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import '../src/App.css'
import Login from './views/Login'
import Register from './views/Register'
import Profile from './views/Profile'
import Community from './views/Community'
import Groups from './views/Groups'
import Header from './components/Header'
import LoadingScreen from './components/LoadingScreen'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AppProvider } from './context/AppContext'

// Development mode: Set dev-user-id if no userId exists
if (!localStorage.getItem('userId')) {
  localStorage.setItem('userId', 'dev-user-id');
  console.log('🔧 Development mode: Using dev-user-id');
}

const AppWrapper = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {loading && <LoadingScreen />}
      <Header />
      <Routes>
        <Route path="/community" element={<Community />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/register" element={<Register />} />
        <Route path="/groups" element={<Groups />} />
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
