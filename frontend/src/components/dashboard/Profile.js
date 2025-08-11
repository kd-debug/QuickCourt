import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Calendar, MapPin, Camera, Lock, X, Heart } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState({ totalBookings: 0, favoriteCount: 0, reviewsGiven: 0 });
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadStats();
    setEditName(user?.fullName || '');
    if (user?.role === 'user') {
      loadFavorites();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const res = await axios.get('/api/users/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const res = await axios.get('/api/users/favorites');
      if (res.data.success) {
        setFavorites(res.data.favorites);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  const handleEditProfile = async () => {
    if (!editName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.patch('/api/users/profile', { fullName: editName.trim() });
      if (res.data.success) {
        updateUser(res.data.user);
        toast.success('Profile updated successfully');
        setShowEditProfileModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a photo file');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      const res = await axios.post('/api/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        updateUser(res.data.user);
        toast.success('Profile photo updated successfully');
        setShowPhotoModal(false);
        setSelectedFile(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile photo');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handlePasswordChange = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.patch('/api/users/change-password', passwordData);
      if (res.data.success) {
        toast.success('Password changed successfully');
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const renderAvatar = () => {
    if (user?.avatar && user.avatar !== 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg') {
      return (
        <img
          src={user.avatar}
          alt={user?.fullName}
          className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
        />
      );
    }
    return (
      <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-white font-bold text-2xl">
          {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
        </span>
      </div>
    );
  };

  const renderQuickStats = () => {
    if (user?.role === 'facility_owner') {
      return (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary-600">Total Bookings</span>
            <span className="font-semibold text-secondary-900">{stats.totalBookings}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-secondary-600">Total Bookings</span>
          <span className="font-semibold text-secondary-900">{stats.totalBookings}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-secondary-600">Favorite Venues</span>
          <span className="font-semibold text-secondary-900">{stats.favoriteCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-secondary-600">Reviews Given</span>
          <span className="font-semibold text-secondary-900">{stats.reviewsGiven}</span>
        </div>
      </div>
    );
  };

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

              {/* Favorite Venues Section for Users */}
              {user?.role === 'user' && (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Favorite Venues
                  </label>
                  <div className="p-3 bg-secondary-50 rounded-lg">
                    {favorites.length > 0 ? (
                      <div className="space-y-2">
                        {favorites.map((venue) => (
                          <div key={venue._id} className="flex items-center space-x-3 p-2 bg-white rounded border">
                            <Heart className="w-4 h-4 text-red-500" />
                            <div className="flex-1">
                              <div className="font-medium text-secondary-900">{venue.name}</div>
                              <div className="text-sm text-secondary-600">{venue.address?.city}, {venue.address?.state}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3 text-secondary-500">
                        <Heart className="w-5 h-5" />
                        <span>No favorite venues yet</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-secondary-200">
              <button
                onClick={() => setShowEditProfileModal(true)}
                className="btn-primary"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Profile Sidebar */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="card text-center">
            {renderAvatar()}
            <h4 className="font-semibold text-secondary-900 mb-2">{user?.fullName || 'User'}</h4>
            <p className="text-sm text-secondary-600 capitalize mb-4">
              {user?.role?.replace('_', ' ') || 'user'}
            </p>
            <button
              onClick={() => setShowPhotoModal(true)}
              className="btn-outline w-full"
            >
              Change Photo
            </button>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <h4 className="font-semibold text-secondary-900 mb-4">Quick Stats</h4>
            {renderQuickStats()}
          </div>

          {/* Account Actions */}
          <div className="card">
            <h4 className="font-semibold text-secondary-900 mb-4">Account Actions</h4>
            <div className="space-y-3">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full text-left p-3 rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <Lock className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-secondary-900">Change Password</span>
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

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Profile</h3>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditProfile}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Photo Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Change Profile Photo</h3>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {selectedFile && (
                <div className="text-sm text-gray-600">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}

              <p className="text-sm text-gray-500">
                Supported formats: JPG, PNG, GIF. Max size: 5MB
              </p>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowPhotoModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePhotoUpload}
                disabled={loading || !selectedFile}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Photo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;