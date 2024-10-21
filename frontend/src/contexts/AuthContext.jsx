import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [dreamer, setDreamer] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [toggleAuth, setToggleAuth] = useState(false);

  const toggleAuthState = (state) => {
    setToggleAuth(state);
  };
  const BASE_URL = 'https://lqp.unycode.net/api/method/';

  const login = async (username, password) => {
    setIsAuthenticating(true);
    
      await axios.post(`${BASE_URL}login`, { usr: username, pwd: password }).then((res) => {
        const user = res.data;
        setDreamer(user.full_name);
        setIsAuthenticated(true);
        setIsAuthenticating(false);

      }).catch((error) => {
        const err = error.response.data;
        setIsAuthenticating(false);
        setAuthError(err);
      }); 
  };

  const signup = async (username) => {
    setIsAuthenticating(true);
    try {
      const response = await axios.post(`${BASE_URL}lqp.api.signup`, { username });
      if (response.data.message === "success") {
        setIsAuthenticated(true);
        setAuthSuccess('Request Sent: Check your email for confirmation.');
      } else {
        setAuthError('Sending Request failed');
        setAuthSuccess('');
      }
    } catch (error) {
      setAuthSuccess('');
      console.error('Sending Request:', error);
      setAuthError('Sending Request failed. Please try again or contact support.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async() => {
    await axios.post(`${BASE_URL}lqp.api.logout`).then(() => {
     window.location.reload()
    }).catch((error) => {
      setIsAuthenticated(false);
    });

  };

  return (
    <AuthContext.Provider value={{
      dreamer,
      isAuthenticated,
      isAuthenticating,
      authError,
      authSuccess,
      toggleAuth,
      toggleAuthState,
      setIsAuthenticated,
      setDreamer,
      login,
      signup,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
