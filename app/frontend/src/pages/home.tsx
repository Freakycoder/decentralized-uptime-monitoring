import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import ContributionStats from '../components/dashboard/ContributionStats';
import DashboardCard from '../components/dashboard/DashboardCard';
import ValidatorRegistration from '../components/dashboard/ValidatorRegistration';
import { contributionMethods, userStats } from '../lib/mockData';
import { staggerContainer, slideUp } from '../lib/framer-variants';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, isValidated } = useAuth();

  // After mounting, we can safely use client-side APIs
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render full content on client-side to avoid hydration mismatch with theme
  if (!mounted) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </Layout>
    );
  }

  // If the user is not validated as a validator, show the validator registration component
  if (!isValidated) {
    return (
      <Layout title="Become a Validator">
        <ValidatorRegistration />
      </Layout>
    );
  }

  return <>
    <WelcomeBanner />
    <Layout title="Dashboard">


      {/* Stats overview */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Your Contribution Stats</h2>
        <ContributionStats stats={userStats} />
      </div>

      {/* Contribution methods */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Contribution Methods</h2>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {contributionMethods.map((method, index) => (
            <motion.div
              key={method.id}
              variants={slideUp}
              custom={index}
            >
              <DashboardCard method={method} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Layout>
  </>;
};

export default Home;