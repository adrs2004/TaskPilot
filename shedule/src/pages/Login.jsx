import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/notes'); // Redirect on success if needed
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="flex w-[90%] max-w-5xl rounded-2xl shadow-2xl overflow-hidden bg-white">
        
        {/* Left Side - GIF */}
        <div className="w-1/2 bg-blue-100 hidden md:flex items-center justify-center p-4">
          <img
            src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXFwcDQzdTQ3c3Jzdmk3YXJmdmY0bm1heGNjbjM1bzN2YzBzM3dseCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l3vRn3I4Cq4U8/giphy.gif"
            alt="login gif"
            className="max-w-full h-auto rounded-lg shadow-lg"
          />
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-10">
          <h2 className="text-3xl font-bold text-blue-600 text-center mb-6">Login</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
