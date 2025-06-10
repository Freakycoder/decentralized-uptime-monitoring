// app/frontend/src/pages/home.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import ContributionStats from '../components/dashboard/ContributionStats';
import DashboardCard from '../components/dashboard/DashboardCard';
import ValidatorRegistration from '../components/dashboard/ValidatorRegistration';
import { contributionMethods, userStats } from '../lib/mockData';
import { staggerContainer, slideUp, fadeIn } from '../lib/framer-variants';
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

  return (
    <Layout title={isValidated ? "Dashboard" : "Getting Started"}>
      {/* Welcome banner always appears first, regardless of validation status */}
      <WelcomeBanner />
      
      {!isValidated ? (
          // Content for non-validated users: show validator registration with context
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Contextual introduction for new users */}
            <motion.div variants={fadeIn} className="text-center space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">Complete Your Validator Setup</h2>
                <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
                  You're just one step away from joining our global network of validators and starting to earn SOL tokens. 
                  The registration process takes about 2 minutes and connects you to thousands of monitoring opportunities worldwide.
                </p>
              </div>
              
              {/* Benefits overview for new users */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="p-6 rounded-lg bg-secondary/20 border border-border">
                  <div className="text-2xl mb-3">💰</div>
                  <h3 className="font-semibold mb-2">Earn Passive Income</h3>
                  <p className="text-sm text-muted-foreground">
                    Get paid in SOL tokens for contributing your device's computing power to monitor websites and networks.
                  </p>
                </div>
                
                <div className="p-6 rounded-lg bg-secondary/20 border border-border">
                  <div className="text-2xl mb-3">🌍</div>
                  <h3 className="font-semibold mb-2">Global Impact</h3>
                  <p className="text-sm text-muted-foreground">
                    Help create a decentralized monitoring network that improves internet reliability for everyone.
                  </p>
                </div>
                
                <div className="p-6 rounded-lg bg-secondary/20 border border-border">
                  <div className="text-2xl mb-3">⚡</div>
                  <h3 className="font-semibold mb-2">Simple Setup</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect your wallet, verify your location, and start earning. No technical expertise required.
                  </p>
                </div>
              </div>
              
              {/* Call to action */}
              <div className="p-6 rounded-lg bg-primary/10 border border-primary/20 max-w-2xl mx-auto">
                <h3 className="font-semibold text-primary mb-2">Ready to Start Earning?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Join over 10,000 validators who have earned a combined 50,000+ SOL tokens by contributing to our network.
                </p>
                <div className="text-sm text-primary font-medium">
                  ↓ Complete the validator registration below ↓
                </div>
              </div>
            </motion.div>

            {/* Validator registration component */}
            <motion.div variants={slideUp}>
              <ValidatorRegistration />
            </motion.div>

            {/* Preview of what's coming after registration */}
            <motion.div variants={fadeIn} className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">What You'll Get After Registration</h3>
                <p className="text-muted-foreground mb-6">
                  Once you complete validator registration, you'll have access to these contribution methods:
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 opacity-75">
                {contributionMethods.slice(0, 3).map((method, index) => (
                  <motion.div
                    key={method.id}
                    variants={slideUp}
                    custom={index}
                    className="relative"
                  >
                    {/* Overlay to show it's coming soon */}
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                      <div className="text-center">
                        <div className="text-2xl mb-2">🔒</div>
                        <div className="text-sm font-medium">Available After Registration</div>
                      </div>
                    </div>
                    <DashboardCard method={method} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          // Content for validated users: show full dashboard
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Stats overview for validated users */}
            <motion.div variants={fadeIn}>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">Your Contribution Stats</h2>
                <ContributionStats stats={userStats} />
              </div>
            </motion.div>

            {/* Contribution methods for validated users */}
            <motion.div variants={slideUp}>
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
            </motion.div>

            {/* Additional dashboard content for validated users */}
            <motion.div variants={fadeIn}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent activity section */}
                <div className="p-6 rounded-lg bg-secondary/20 border border-border">
                  <h3 className="font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Website monitoring task completed</span>
                      <span className="text-sm font-medium text-emerald-500">+0.05 SOL</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Network metrics submitted</span>
                      <span className="text-sm font-medium text-emerald-500">+0.08 SOL</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Geographic data collected</span>
                      <span className="text-sm font-medium text-emerald-500">+0.04 SOL</span>
                    </div>
                  </div>
                </div>

                {/* Network status section */}
                <div className="p-6 rounded-lg bg-secondary/20 border border-border">
                  <h3 className="font-semibold mb-4">Network Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Active Validators</span>
                      <span className="text-sm font-medium">12,847</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Websites Monitored</span>
                      <span className="text-sm font-medium">3,421</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Your Validator Rank</span>
                      <span className="text-sm font-medium text-blue-500">#247</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </Layout>
    );
};

export default Home;