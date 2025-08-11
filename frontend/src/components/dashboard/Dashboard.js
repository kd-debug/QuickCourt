import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardSidebar from './DashboardSidebar';
import DashboardHome from './DashboardHome';
import Profile from './Profile';
import Venues from '../venues/VenuesList';
import MyFacilities from '../venues/MyFacilities';

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
            <Route path="/facilities" element={<MyFacilities />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
