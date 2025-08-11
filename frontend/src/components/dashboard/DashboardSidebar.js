import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  User, 
  Calendar, 
  MapPin, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Building,
  Users,
  BarChart3
} from 'lucide-react';

const DashboardSidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getMenuItems = () => {
    const baseItems = [
      { path: '/dashboard', icon: <Home className="w-5 h-5" />, label: 'Dashboard' },
      { path: '/dashboard/profile', icon: <User className="w-5 h-5" />, label: 'Profile' },
    ];

    if (user?.role === 'facility_owner') {
      baseItems.push(
        { path: '/dashboard/facilities', icon: <Building className="w-5 h-5" />, label: 'My Facilities' },
        { path: '/dashboard/bookings', icon: <Calendar className="w-5 h-5" />, label: 'Bookings' },
        { path: '/dashboard/analytics', icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics' }
      );
    } else if (user?.role === 'admin') {
      baseItems.push(
        { path: '/dashboard/users', icon: <Users className="w-5 h-5" />, label: 'User Management' },
        { path: '/dashboard/facilities', icon: <Building className="w-5 h-5" />, label: 'Facility Approval' },
        { path: '/dashboard/analytics', icon: <BarChart3 className="w-5 h-5" />, label: 'Platform Analytics' }
      );
    } else {
      baseItems.push(
        { path: '/dashboard/bookings', icon: <Calendar className="w-5 h-5" />, label: 'My Bookings' },
        { path: '/dashboard/venues', icon: <MapPin className="w-5 h-5" />, label: 'Find Venues' }
      );
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-white shadow-md text-secondary-600 hover:text-primary-600 transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-6 border-b border-secondary-200">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <span className="text-xl font-bold text-gradient">QuickCourt</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-secondary-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary-900 truncate">
                {user?.fullName || 'User'}
              </p>
              <p className="text-xs text-secondary-500 capitalize">
                {user?.role?.replace('_', ' ') || 'user'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${location.pathname === item.path
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                  : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                }
              `}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default DashboardSidebar;
