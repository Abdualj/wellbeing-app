import { useState } from 'react';
import React from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  //käsittelee input muutokset
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);
  };

  //lomakkeen lähetys
  const handleSubmit = async (event) => {
    event.preventDefault();
    // Validointi
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError('');

    try {
      //lähetään tiedot backendille
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      localStorage.setItem('token', data.data.accessToken);
      if (data.data.user?.id) {
        localStorage.setItem('userId', data.data.user.id);
      }
      
      window.location.assign('/profile');
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sage-50 to-gray-50">
      <div className="flex flex-col items-center w-full max-w-md px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-sage-900 whitespace-nowrap">Welcome to WellSpring</h1>
          <p className="text-gray-600 mt-4">Continue your wellness journey</p>
        </div>

        {error && (
          <div className="w-full bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div>
            <label htmlFor="email" className="block mb-2 font-medium text-sage-900 text-sm">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={handleInputChange}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-white border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 font-medium text-sage-900 text-sm">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-white border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full font-medium text-white bg-sage-700 hover:bg-sage-800 py-3 rounded-lg transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Not a member?{' '}
          <a href="./register" className="text-sage-700 font-medium hover:text-sage-800 transition">
            Register Here
          </a>
        </p>
      </div>
    </section>
  );
};

export default Login;