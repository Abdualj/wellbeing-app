import { useState } from 'react'

const Register = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
      if (name === 'username') setUsername(value)
      if (name === 'email') setEmail(value)
      if (name === 'password') setPassword(value)
      if (name === 'confirmPassword') setConfirmPassword(value)
  }

    const handleSubmit = async (event) => {
  event.preventDefault();

  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  setLoading(true);

  try {
    const res = await fetch('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Registration failed');
      return;
    }

    localStorage.setItem('token', data.data.accessToken);
    window.location.href = '/';
  } catch (err) {
    alert('Network error');
  } finally {
    setLoading(false);
  }
};


  return (

    <>
      <section className="flex items-center justify-center min-h-screen bg-gray-200">
        <div className="main bg-white px-16 py-20 rounded-3xl text-center w-full max-w-md shadow-xl border-gray-100">
          <div className="border-b-2 border-gray-300 mb-6 pb-4">
            <h1 className="text-3xl text-sage-900 font-bold">WellSpring</h1>
            <h5 className="text-lg text-sage-900 mt-4">Create an account</h5>
          </div>
          <form onSubmit={handleSubmit} className="text-lg">
            <div>
              <label htmlFor="registerusername" className="block mt-4 mb-2 text-left text-sage-900 font-medium">Username</label>
              <input
                name="username"
                type="text"
                id="registerusername"
                placeholder="Enter your username"
                onChange={handleInputChange}
                className="block w-full mb-6 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-green-400 bg-gray-50" required/>
            </div>
            <div>
              <label htmlFor="registeremail" className="block mt-4 mb-2 text-left text-sage-900 font-medium">Email</label>
              <input
                name="email"
                type="email"
                id="registeremail"
                placeholder="Enter your email"
                onChange={handleInputChange}
                className="block w-full mb-6 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-green-400 bg-gray-50" required/>
            </div>
            <div>
              <label htmlFor="registerpassword" className="block mt-4 mb-2 text-left text-sage-900 font-medium">Password</label>
              <input
                name="password"
                type="password"
                id="registerpassword"
                placeholder="Enter your password"
                onChange={handleInputChange}
                className="block w-full mb-6 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-green-400 bg-gray-50" required/>
            </div>
            <div>
              <label htmlFor="registerconfirmpassword" className="block mt-4 mb-2 text-left text-sage-900 font-medium">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                id="registerconfirmpassword"
                placeholder="Confirm your password"
                onChange={handleInputChange}
                className="block w-full mb-6 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-green-400 bg-gray-50" required/>
            </div>
            <button type="submit" disabled={loading} className="font-medium text-base text-white bg-sage-900 hover:bg-green-900 px-6 py-2 rounded-md w-full mt-2">Register</button>
          </form>
          <p className="mt-6">Already a member?
            <a href="./login" className="text-blue-500 hover:underline"> Login Here</a>
          </p>
        </div>
      </section>
    </>
  );
};

export default Register;