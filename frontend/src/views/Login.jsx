import { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3000/api/v1/auth/login', {
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
      window.location.href = '/';
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="main bg-white px-16 py-20 rounded-3xl text-center w-full max-w-md shadow-xl border border-gray-100">
        <div className="border-b-2 border-gray-300 mb-6 pb-4">
          <h1 className="text-3xl text-sage-900 font-bold">WellSpring</h1>
          <h5 className="text-lg text-sage-900 mt-4">Login to continue</h5>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="text-lg">
          <div>
            <label className="block mt-4 mb-2 text-left font-medium">Email</label>
            <input
              name="email"
              type="email"
              onChange={handleInputChange}
              className="block w-full mb-6 px-4 py-3 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block mt-4 mb-2 text-left font-medium">Password</label>
            <input
              name="password"
              type="password"
              onChange={handleInputChange}
              className="block w-full mb-6 px-4 py-3 border rounded-md"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="font-medium text-white bg-sage-900 px-6 py-2 rounded-md w-2/3"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6">
          Not a member?{' '}
          <a href="./register" className="text-blue-500 hover:underline">
            Register Here
          </a>
        </p>
      </div>
    </section>
  );
};

export default Login;