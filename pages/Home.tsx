import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import GuestHome from './GuestHome';
import CustomerHome from './CustomerHome';
import AgentHome from './AgentHome';
import LoadingState from '../components/LoadingState';

const Home: React.FC = () => {
  const { user, profile, role, loading } = useAuth();
  const navigate = useNavigate();

  // If user is authenticated via OAuth but has not yet completed onboarding (no user_type)
  useEffect(() => {
    if (!loading && user && !profile?.user_type) {
      navigate('/auth');
    }
  }, [user, profile, loading, navigate]);

  // If session is still verifying, show clean animated skeleton
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-surface dark:bg-[#0D0D0D]">
        <LoadingState message="Preparing your beauty experience..." />
      </div>
    );
  }

  // 1. Logged-out guest -> Full marketing / landing page
  if (!user) {
    return <GuestHome />;
  }

  // If un-onboarded profile, render loading while redirecting to /auth
  if (!profile?.user_type) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-surface dark:bg-[#0D0D0D]">
        <LoadingState message="Setting up your account..." />
      </div>
    );
  }

  // 2. Logged-in agent -> Dedicated agent operations & bookings home
  if (role === UserRole.AGENT) {
    return <AgentHome />;
  }

  // 3. Logged-in customer (or admin) -> Personalized dashboard-style home
  return <CustomerHome />;
};

export default Home;
