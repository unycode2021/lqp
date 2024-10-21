import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, signup, isAuthenticating, authError, authSuccess } = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();
    login(username, password);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    signup(username);
  };

  if (authSuccess) {
    setIsLogin(true)  
  }

  return (
    <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
      <DialogTitle>{isLogin ? 'Login' : 'Sign up'}</DialogTitle>
      <DialogDescription>Login for full access</DialogDescription>

      <Input
        type="email"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Email"
      />
      {isLogin ? <><Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      /></> : null}
      <Button type="submit">{isLogin ? 'Login' : 'Sign up'} {isAuthenticating ? '....' : ''} </Button>
      <Button type="button" variant="link" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Sign up?' : 'Already Signed up? Login'}
      </Button>
      {authError && <p className="text-red-500">{authError}</p>}
      {authSuccess && <p className="text-green-500">{authSuccess}</p>}
    </form>
  );
};

export default AuthForm;