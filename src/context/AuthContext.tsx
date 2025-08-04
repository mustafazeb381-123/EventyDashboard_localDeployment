import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Check localStorage for a token on initial load
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This is where you would check for a stored token (e.g., in localStorage)
    // and validate it with your backend.
    const token = localStorage.getItem('authToken');
    if (token) {
      // For this example, we'll just assume a token means a logged-in user.
      // In a real app, you'd decode the token or call an API to get user data.
      setUser({ username: 'DemoUser' }); 
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    // Store the token and set the user state
    localStorage.setItem('authToken', token);
    setUser(userData);
  };

  const logout = () => {
    // Clear the token and user state
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const isAuthenticated = !!user; // !! converts the object to a boolean

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);