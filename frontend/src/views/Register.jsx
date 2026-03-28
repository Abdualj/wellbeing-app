import { useState } from 'react'

const Register = () => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
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

    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    if (!dataProcessingConsent) {
      alert('You must consent to data processing')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('http://localhost:3000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          consentGiven: dataProcessingConsent,
          dataProcessingConsent,
          marketingConsent: false
        })
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.message || 'Registration failed')
        return
      }

      // Store authentication data
      localStorage.setItem('token', data.data.accessToken)
      if (data.data.user?.id) {
        localStorage.setItem('userId', data.data.user.id)
      }
      
      // Redirect to profile page after registration
      window.location.href = '/profile'
    } catch (err) {
      alert('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="flex items-center justify-center min-h-screen bg-sage-50 backdrop-blur-sm pt-24">
      <div className="flex flex-col items-center w-full max-w-xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl text-sage-900 font-bold">Welcome to WellSpring</h1>
          <h5 className="text-lg text-sage-900 mt-4">Begin your wellness journey</h5>
        </div>

        <div className="main bg-white px-16 py-20 rounded-3xl text-center w-full shadow-xl border-gray-100">
          <form onSubmit={handleSubmit} className="text-lg">
            <div>
              <label className="block mt-4 mb-2 text-left text-sage-900 font-medium">First Name</label>
              <input
                name="firstname"
                type="text"
                value={firstName}
                placeholder="Enter your First name"
                onChange={handleInputChange}
                className="block w-full mb-6 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-green-400 bg-gray-50"
                required
              />
            </div>

            <div>
              <label className="block mt-4 mb-2 text-left text-sage-900 font-medium">Last Name</label>
              <input
                name="lastname"
                type="text"
                value={lastName}
                placeholder="Enter your Last name"
                onChange={handleInputChange}
                className="block w-full mb-6 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-green-400 bg-gray-50"
                required
              />
            </div>

            <div>
              <label className="block mt-4 mb-2 text-left text-sage-900 font-medium">Email</label>
              <input
                name="email"
                type="email"
                value={email}
                placeholder="Enter your email"
                onChange={handleInputChange}
                className="block w-full mb-6 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-green-400 bg-gray-50"
                required
              />
            </div>

            <div>
              <label className="block mt-4 mb-2 text-left text-sage-900 font-medium">Password</label>
              <input
                name="password"
                type="password"
                value={password}
                placeholder="Enter your password"
                onChange={handleInputChange}
                className="block w-full mb-6 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-green-400 bg-gray-50"
                required
              />
            </div>

            <div>
              <label className="block mt-4 mb-2 text-left text-sage-900 font-medium">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                placeholder="Confirm your password"
                onChange={handleInputChange}
                className="block w-full mb-6 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-green-400 bg-gray-50"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="font-medium text-base text-white bg-sage-900 hover:bg-green-900 px-6 py-2 rounded-md w-full mt-2"
            >
              Register
            </button>

            <div className="mt-6 flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <input
                type="checkbox"
                checked={dataProcessingConsent}
                onChange={(e) => setDataProcessingConsent(e.target.checked)}
                className="mt-1 w-5 h-5 accent-green-600 cursor-pointer"
              />
              <label className="text-sm text-sage-900 leading-relaxed cursor-pointer">
                I agree to the processing of my personal data
              </label>
            </div>
          </form>

          <p className="mt-6 text-sage-900">
            Already a member?
            <a href="./login" className="text-sage-900 hover:underline"> Login Here</a>
          </p>
        </div>
      </div>
    </section>
  )
}

export default Register