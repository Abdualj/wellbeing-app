import { useState } from 'react'

const Register = () => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dataProcessingConsent, setDataProcessingConsent] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'firstname') setFirstName(value)
    if (name === 'lastname') setLastName(value)
    if (name === 'email') setEmail(value)
    if (name === 'password') setPassword(value)
    if (name === 'confirmPassword') setConfirmPassword(value)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    console.log('[Register] Starting registration...');
    console.log('[Register] Form data:', { firstName, lastName, email, dataProcessingConsent });

    // Validation
    if (!firstName.trim()) {
      setError('First name is required');
      return;
    }

    if (!lastName.trim()) {
      setError('Last name is required');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Valid email is required');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      console.error('[Register] Password mismatch');
      return
    }

    if (!dataProcessingConsent) {
      setError('You must consent to data processing')
      console.error('[Register] No consent given');
      return
    }

    setLoading(true)

    try {
      const payload = {
        firstName,
        lastName,
        email,
        password,
        consentGiven: dataProcessingConsent,
        dataProcessingConsent,
        marketingConsent: false
      };

      console.log('[Register] Sending request with payload:', { ...payload, password: '[REDACTED]' });

      const res = await fetch('http://localhost:3000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      console.log('[Register] Response status:', res.status);

      const data = await res.json()
      console.log('[Register] Response data:', data);

      if (!res.ok) {
        const errorMsg = data.message || data.error || 'Registration failed';
        console.error('[Register] Registration failed:', errorMsg);
        setError(errorMsg)
        return
      }

      console.log('[Register] Registration successful!');
      localStorage.setItem('token', data.data.accessToken)
      if (data.data.user?.id) {
        localStorage.setItem('userId', data.data.user.id)
      }
      
      console.log('[Register] Redirecting to profile...');
      window.location.href = '/profile'
    } catch (err) {
      console.error('[Register] Network error:', err);
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sage-50 to-gray-50 py-12">
      <div className="flex flex-col items-center w-full max-w-md px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-sage-900 whitespace-nowrap">Welcome to WellSpring</h1>
          <p className="text-gray-600 mt-4">Begin your wellness journey</p>
        </div>

        {error && (
          <div className="w-full bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div>
            <label className="block mb-2 font-medium text-sage-900 text-sm">First Name</label>
            <input
              name="firstname"
              type="text"
              value={firstName}
              onChange={handleInputChange}
              placeholder="John"
              className="w-full px-4 py-3 bg-white border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-sage-900 text-sm">Last Name</label>
            <input
              name="lastname"
              type="text"
              value={lastName}
              onChange={handleInputChange}
              placeholder="Doe"
              className="w-full px-4 py-3 bg-white border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-sage-900 text-sm">Email</label>
            <input
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
            <label className="block mb-2 font-medium text-sage-900 text-sm">Password</label>
            <input
              name="password"
              type="password"
              value={password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-white border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters</p>
          </div>

          <div>
            <label className="block mb-2 font-medium text-sage-900 text-sm">Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              className="w-full px-4 py-3 bg-white border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition"
              required
            />
          </div>

          <div className="flex items-start gap-3 bg-white border border-sage-200 rounded-lg p-4">
            <input
              type="checkbox"
              checked={dataProcessingConsent}
              onChange={(e) => setDataProcessingConsent(e.target.checked)}
              className="mt-1 w-4 h-4 accent-sage-600 cursor-pointer"
            />
            <label className="text-xs text-gray-600 leading-relaxed cursor-pointer">
              I agree to the processing of my personal data
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full font-medium text-white bg-sage-700 hover:bg-sage-800 py-3 rounded-lg transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Already a member?{' '}
          <a href="./login" className="text-sage-700 font-medium hover:text-sage-800 transition">
            Login Here
          </a>
        </p>
      </div>
    </section>
  )
}

export default Register