// app/frontend/src/pages/home.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import ContributionStats from '../components/dashboard/ContributionStats';
import DashboardCard from '../components/dashboard/DashboardCard';
import ValidatorRegistration from '../components/dashboard/ValidatorRegistration';
import { contributionMethods, userStats } from '../lib/mockData';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, Zap, Globe, Users, Activity, Clock } from 'lucide-react';

const Home = () => {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, isValidated } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-600">Loading dashboard...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={isValidated ? "Dashboard" : "Getting Started"}>
      {/* Welcome banner always appears first */}
      <WelcomeBanner />
      
      {!isValidated ? (
        // Content for non-validated users: show validator registration with context
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* Contextual introduction for new users */}
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">Complete Your Validator Setup</h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                You're just one step away from joining our global network of validators and starting to earn SOL tokens. 
                The registration process takes about 2 minutes and connects you to thousands of monitoring opportunities worldwide.
              </p>
            </div>
            
            {/* Benefits overview for new users */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-8"
              >
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Earn Passive Income</h3>
                <p className="text-gray-600">
                  Get paid in SOL tokens for contributing your device's computing power to monitor websites and networks.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <Globe className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Global Impact</h3>
                <p className="text-gray-600">
                  Help create a decentralized monitoring network that improves internet reliability for everyone.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-8"
              >
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Simple Setup</h3>
                <p className="text-gray-600">
                  Connect your wallet, verify your location, and start earning. No technical expertise required.
                </p>
              </motion.div>
            </div>
            
            {/* Call to action */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-8 max-w-3xl mx-auto"
            >
              <h3 className="text-2xl font-bold text-indigo-900 mb-3">Ready to Start Earning?</h3>
              <p className="text-indigo-700 mb-4 text-lg">
                Join over 10,000 validators who have earned a combined 50,000+ SOL tokens by contributing to our network.
              </p>
              <div className="text-indigo-600 font-semibold">
                ↓ Complete the validator registration below ↓
              </div>
            </motion.div>
          </div>

          {/* Validator registration component */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <ValidatorRegistration />
          </motion.div>

          {/* Preview of what's coming after registration */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">What You'll Get After Registration</h3>
              <p className="text-lg text-gray-600 mb-8">
                Once you complete validator registration, you'll have access to these contribution methods:
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 opacity-75">
              {contributionMethods.slice(0, 3).map((method, index) => (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + (index * 0.1) }}
                  className="relative"
                >
                  {/* Overlay to show it's coming soon */}
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="text-3xl mb-3">🔒</div>
                      <div className="font-semibold text-gray-700">Available After Registration</div>
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* Stats overview for validated users */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Contribution Overview</h2>
            <ContributionStats stats={userStats} />
          </div>

          {/* Contribution methods for validated users */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Contribution Methods</h2>
              <div className="text-sm text-gray-600">
                {contributionMethods.filter(m => m.active).length} of {contributionMethods.length} methods active
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {contributionMethods.map((method, index) => (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <DashboardCard method={method} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Additional dashboard sections for validated users */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent activity section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl border border-gray-200 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-6 h-6 text-gray-600" />
                <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
              </div>
              <div className="space-y-4">
                {[
                  { action: 'Website monitoring task completed', reward: '+0.05 SOL', time: '2 min ago' },
                  { action: 'Network metrics submitted', reward: '+0.08 SOL', time: '15 min ago' },
                  { action: 'Geographic data collected', reward: '+0.04 SOL', time: '1 hour ago' },
                  { action: 'Computing task processed', reward: '+0.12 SOL', time: '2 hours ago' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-medium text-gray-900">{activity.action}</div>
                      <div className="text-sm text-gray-500">{activity.time}</div>
                    </div>
                    <div className="text-emerald-600 font-semibold">{activity.reward}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Network status section */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl border border-gray-200 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-gray-600" />
                <h3 className="text-xl font-bold text-gray-900">Network Status</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-700">Active Validators</span>
                  <span className="font-semibold text-gray-900">12,847</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-700">Websites Monitored</span>
                  <span className="font-semibold text-gray-900">3,421</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <span className="text-blue-700">Your Validator Rank</span>
                  <span className="font-semibold text-blue-600">#247</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-emerald-700">Network Health</span>
                  </div>
                  <span className="font-semibold text-emerald-600">Excellent</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </Layout>
  );
};

export default Home;