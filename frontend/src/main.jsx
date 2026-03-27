import React from 'react'
import ReactDOM from 'react-dom/client'
import '../src/App.css'
import Login from './views/Login'
import Register from './views/Register'
import Profile from './views/Profile'
import Community from './views/Community'
import Header from './components/Header'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/community" element={<Community />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
  </React.StrictMode>,
)
