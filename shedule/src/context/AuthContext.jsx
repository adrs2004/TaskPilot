import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const user = JSON.parse(atob(token.split('.')[1]));
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });
      localStorage.setItem('token', response.data.token);
      const user = JSON.parse(atob(response.data.token.split('.')[1]));
      setCurrentUser(user);
      navigate('/notes');
    } catch (error) {
      throw error.response?.data?.error || 'Login failed';
    }
  };

  const signup = async (username, password, name, dob, sex, mobile, address, pincode, user_type) => {
    try {
      await axios.post('http://localhost:5000/register', { 
        username, 
        password,
        name,
        dob,
        sex,
        mobile,
        address,
        pincode,
        user_type
      });
      navigate('/login');
    } catch (error) {
      throw error.response?.data?.error || 'Registration failed';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    navigate('/login');
  };

  const value = {
    currentUser,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}