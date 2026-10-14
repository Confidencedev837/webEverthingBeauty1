import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import GuestHome from './GuestHome';
import CustomerHome from './CustomerHome';
import AgentHome from './AgentHome';
import LoadingState from '../components/LoadingState';

const Home: React.FC = () => {
  const { user, role, loading } = useAuth();

  // If session is still verifying, show clean animated skeleton
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-surface dark:bg-[#0D0D0D]">
        <LoadingState text="Preparing your beauty experience..." />
      </div>
    );
  }

  // 1. Logged-out guest -> Full marketing / landing page
  if (!user) {
    return <GuestHome />;
  }

  // 2. Logged-in agent -> Dedicated agent operations & bookings home
  if (role === UserRole.AGENT) {
    return <AgentHome />;
  }

  // 3. Logged-in customer (or admin) -> Personalized dashboard-style home
  return <CustomerHome />;
};

export default Home;
