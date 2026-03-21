import React from 'react'
import ReactDOM from 'react-dom/client'
import '../src/App.css'
import Login from './views/Login'
import Register from './views/Register'
import Profile from './views/Profile'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
  </React.StrictMode>,
)
