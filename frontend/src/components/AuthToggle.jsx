import React from 'react';
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from 'lucide-react';

const AuthToggle = ({ toggleAuth, toggleAuthState }) => {
       return (
              <Button onClick={() => toggleAuthState()}>
                     {toggleAuth ? <LogOut size={20} /> : <LogIn size={20} />}
              </Button>
       );
};

export default AuthToggle;
