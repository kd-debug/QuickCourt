import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Calendar, MapPin } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Profile</h1>
        <p className="text-secondary-600">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-6">Personal Information</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Full Name
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg">
                    <User className="w-5 h-5 text-secondary-400" />
                    <span className="text-secondary-900">{user?.fullName || 'Not provided'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg">
                    <Mail className="w-5 h-5 text-secondary-400" />
                    <span className="text-secondary-900">{user?.email || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Role
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg">
                    <User className="w-5 h-5 text-secondary-400" />
                    <span className="text-secondary-900 capitalize">
                      {user?.role?.replace('_', ' ') || 'user'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Account Status
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${user?.isEmailVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className="text-secondary-900">
                      {user?.isEmailVerified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Member Since
                </label>
                <div className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-secondary-400" />
                  <span className="text-secondary-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-secondary-200">
              <button className="btn-primary">
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Profile Sidebar */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="card text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <h4 className="font-semibold text-secondary-900 mb-2">{user?.fullName || 'User'}</h4>
            <p className="text-sm text-secondary-600 capitalize mb-4">
              {user?.role?.replace('_', ' ') || 'user'}
            </p>
            <button className="btn-outline w-full">
              Change Photo
            </button>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <h4 className="font-semibold text-secondary-900 mb-4">Quick Stats</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600">Total Bookings</span>
                <span className="font-semibold text-secondary-900">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600">Favorite Venues</span>
                <span className="font-semibold text-secondary-900">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600">Reviews Given</span>
                <span className="font-semibold text-secondary-900">5</span>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="card">
            <h4 className="font-semibold text-secondary-900 mb-4">Account Actions</h4>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-secondary-900">Change Password</span>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-secondary-900">Email Preferences</span>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-secondary-900">Location Settings</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
