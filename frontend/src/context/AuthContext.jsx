import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile if token is present on startup
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await client.get('/api/users/me');
          setUser(response.data);
        } catch (err) {
          console.error("Failed to load user session", err);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      // The backend expects OAuth2PasswordRequestForm (form-url-encoded)
      const formData = new URLSearchParams();

      formData.append("username", email);
      formData.append("password", password);

      const response = await client.post(
        "/api/auth/login",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);

      // Fetch user details immediately after login
      const userResponse = await client.get('/api/users/me');
      setUser(userResponse.data);
      setLoading(false);
      return userResponse.data;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.detail || 'Invalid email or password';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    setLoading(true);
    try {
      // Create user account
      await client.post('/api/users/register', { name, email, password });
      
      // Auto login after successful registration
      return await login(email, password);
    } catch (err) {
      setLoading(false);
      // FastAPI errors are often list of objects in detail if validation errors
      let errMsg = 'Registration failed';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errMsg = err.response.data.detail.map(d => d.msg).join(', ');
        } else {
          errMsg = err.response.data.detail;
        }
      }
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
