import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow h-16 flex items-center justify-between px-6 z-10">
      <div className="flex items-center text-lg font-semibold text-gray-700">
        TransitOps
      </div>
      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
            <User size={16} />
            <span className="font-medium">{user.firstName} {user.lastName}</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full ml-2">
              {user.role?.name || 'User'}
            </span>
          </div>
        )}
        <Button 
          onClick={handleLogout}
          variant="outline"
          className="flex items-center space-x-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </Button>
      </div>
    </header>
  );
}
