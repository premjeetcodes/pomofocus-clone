import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  CheckCircle,
  BarChart3,
  Settings,
  User,
  LogOut,
  Crown,
  Keyboard,
  Trash2,
  ChevronDown
} from 'lucide-react';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  const userMenuItems = [
    { icon: User, label: 'Profile', action: () => { navigate('/profile'); setShowUserMenu(false); } },
    { icon: Crown, label: 'Premium', action: () => setShowUserMenu(false) },
    { icon: LogOut, label: 'Logout', action: handleLogout },
    { icon: Keyboard, label: 'Shortcuts', action: () => setShowUserMenu(false) },
    { icon: Trash2, label: 'Delete Account', action: () => setShowUserMenu(false) }
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="bg-white bg-opacity-10 backdrop-blur-sm border-b border-white border-opacity-20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors">
            <CheckCircle className="w-6 h-6" />
            <span className="text-xl font-semibold">Pomofocus</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {/* Report Button */}
            <Link
              to="/reports"
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Report</span>
            </Link>

            {/* Settings Button */}
            <Link
              to="/settings"
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Setting</span>
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
              >
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg border border-white border-opacity-20 z-50">
                  <div className="py-2">
                    {userMenuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={item.action}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default Header; 