import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardSidebar from './DashboardSidebar';
import DashboardHome from './DashboardHome';
import Profile from './Profile';
import Venues from '../venues/VenuesList';
import MyFacilities from '../venues/MyFacilities';
import VenueDetails from '../venues/VenueDetails';
import VenueBooking from '../venues/VenueBooking';
import MyBookings from './MyBookings';
import OwnerBookings from './OwnerBookings';
import Analytics from './Analytics';
import AdminUserManagement from './AdminUserManagement';
import AdminPlatformAnalytics from './AdminPlatformAnalytics';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="flex">
        <DashboardSidebar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/venues" element={<Venues />} />
            <Route path="/venues/:id" element={<VenueDetails />} />
            <Route path="/venues/:id/book" element={<VenueBooking />} />
            <Route path="/facilities" element={<MyFacilities />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/owner-bookings" element={<OwnerBookings />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/user-management" element={<AdminUserManagement />} />
            <Route path="/platform-analytics" element={<AdminPlatformAnalytics />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
