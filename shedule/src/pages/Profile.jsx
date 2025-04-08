import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Profile() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    username: '',
    name: '',
    dob: '',
    sex: '',
    mobile: '',
    address: '',
    pincode: '',
    user_type: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(response.data);
        setError('');
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile. Please try again.');
      }
    };

    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/profile', profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Profile updated successfully!');
      setError('');
      setIsEditing(false);
      const response = await axios.get('http://localhost:5000/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('');
      setError('Failed to update profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="w-full max-w-4xl bg-white/30 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/40 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
          <button
            onClick={() => navigate('/notes')}
            className=" bg-red-600 text-white rounded-md hover:bg-red-70 px-4 py-2 shadow transition-all duration-200"
          >
            ← Back to Notes
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-md">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-700 rounded-md">
            {message}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6 text-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  value={profile.username || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={profile.dob || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select
                  name="sex"
                  value={profile.sex || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mobile Number</label>
                <input
                  type="tel"
                  name="mobile"
                  value={profile.mobile || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">User Type</label>
                <select
                  name="user_type"
                  value={profile.user_type || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select</option>
                  <option value="Student">Student</option>
                  <option value="Job Person">Job Person</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                name="address"
                value={profile.address || ''}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={profile.pincode || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-400 text-gray-700 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6 text-gray-900">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Username', value: profile.username },
                { label: 'Full Name', value: profile.name },
                { label: 'Date of Birth', value: profile.dob },
                { label: 'Gender', value: profile.sex },
                { label: 'Mobile Number', value: profile.mobile },
                { label: 'User Type', value: profile.user_type }
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-sm text-gray-600">{item.label}</p>
                  <p className="text-base font-medium">{item.value || 'Not set'}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="text-base font-medium whitespace-pre-line">{profile.address || 'Not set'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Pincode</p>
              <p className="text-base font-medium">{profile.pincode || 'Not set'}</p>
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2  bg-red-600 text-white rounded-md hover:bg-red-70"
              >
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
