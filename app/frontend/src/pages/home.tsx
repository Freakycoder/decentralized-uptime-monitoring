import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/layout/Layout';
import ValidatorRegistration from '../components/dashboard/ValidatorRegistration';
import DashboardCard from '../components/dashboard/DashboardCard';
import { contributionMethods, userStats } from '../lib/mockData';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { 
  Globe, 
  Shield, 
  Activity, 
  Users,
  Plus,
  CheckCircle,
  BarChart3,
  Zap,
  Award,
  Clock,
  TrendingUp
} from 'lucide-react';
import axios from 'axios';

const Home = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, isValidated } = useAuth();
  const { addNotification } = useNotifications();
  const [showValidatorModal, setShowValidatorModal] = useState(false);
  
  // Website monitoring form state
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setMounted(true);
    
    // Check if validator registration should be shown
    if (router.query.showValidator === 'true') {
      setShowValidatorModal(true);
      // Remove query param
      router.replace('/home', undefined, { shallow: true });
    }
  }, [router]);

  const handleWebsiteSubmission = async () => {
    setError('');
    setSuccess('');

    if (!websiteUrl.trim()) {
      setError('Please enter a website URL');
      return;
    }

    try {
      new URL(websiteUrl);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setFormLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:3001/website-monitor/add', {
        url_to_monitor: websiteUrl
      });

      if (response.data.status_code === 200) {
        setSuccess('Website successfully added for monitoring!');
        addNotification(
          'Website Added Successfully', 
          `${websiteUrl} has been added to your monitoring list.`,
          "monitoring"
        );
        setWebsiteUrl('');
      } else if (response.data.status_code === 409) {
        setError('Website is already being monitored');
      } else {
        setError('Failed to add website. Please try again.');
      }
    } catch (error) {
      console.error('Error adding website:', error);
      setError('Failed to add website. Server error occurred.');
    } finally {
      setFormLoading(false);
    }
  };

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
    <Layout title="Dashboard">
      <div className="space-y-8">
        {/* Content Based on User Type */}
        <AnimatePresence mode="wait">
          {!isValidated ? (
            // Non-Validator Dashboard
            <motion.div
              key="non-validator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Website Monitoring Section */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Website Monitoring</h2>
                    <p className="text-gray-600">Add and manage your website monitoring</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Add Website Form */}
                    <div className="lg:col-span-2 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website URL
                        </label>
                        <div className="flex gap-3">
                          <input
                            type="url"
                            placeholder="https://your-website.com"
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleWebsiteSubmission}
                            disabled={formLoading}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                          >
                            {formLoading ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Plus className="w-5 h-5" />
                            )}
                            {formLoading ? 'Adding...' : 'Add Website'}
                          </motion.button>
                        </div>
                      </div>

                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                          {error}
                        </div>
                      )}

                      {success && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          {success}
                        </div>
                      )}
                    </div>

                    {/* Monitoring Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Monitoring Details</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Check Interval:</span>
                          <span className="font-medium">10 minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Session Duration:</span>
                          <span className="font-medium">80 minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cost per Session:</span>
                          <span className="font-medium">$2.40</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Validator Registration CTA */}
              <section>
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-1">Become a Validator</h3>
                        <p className="text-gray-300">Earn SOL tokens by contributing to the network</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowValidatorModal(true)}
                      className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                    >
                      Get Started
                    </motion.button>
                  </div>
                </div>
              </section>
            </motion.div>
          ) : (
            // Validator Dashboard
            <motion.div
              key="validator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Validator Status Overview */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Validator Status</h2>
                    <p className="text-gray-600">Monitor your validator performance and earnings</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    Active
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm text-gray-600">Today's Earnings</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">0.24 SOL</div>
                    <div className="text-sm text-emerald-600">+12% from yesterday</div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Active Tasks</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">23</div>
                    <div className="text-sm text-gray-600">Monitoring websites</div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-gray-600">Global Rank</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">#247</div>
                    <div className="text-sm text-gray-600">Out of 12,847</div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Uptime</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">99.8%</div>
                    <div className="text-sm text-emerald-600">Excellent</div>
                  </div>
                </div>
              </section>

              {/* Contribution Methods */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Contribution Methods</h2>
                    <p className="text-gray-600">Manage your active contribution streams</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    {contributionMethods.filter(m => m.active).length} of {contributionMethods.length} active
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
              </section>

              {/* Performance Overview */}
              <section>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Activity */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Activity className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                    </div>
                    <div className="space-y-4">
                      {[
                        { action: 'Website monitoring completed', reward: '+0.05 SOL', time: '2 min ago', type: 'website' },
                        { action: 'Network metrics submitted', reward: '+0.08 SOL', time: '15 min ago', type: 'network' },
                        { action: 'Geographic data collected', reward: '+0.04 SOL', time: '1 hour ago', type: 'geo' },
                        { action: 'Computing task processed', reward: '+0.12 SOL', time: '2 hours ago', type: 'compute' }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              activity.type === 'website' ? 'bg-blue-100 text-blue-600' :
                              activity.type === 'network' ? 'bg-emerald-100 text-emerald-600' :
                              activity.type === 'geo' ? 'bg-amber-100 text-amber-600' :
                              'bg-purple-100 text-purple-600'
                            }`}>
                              {activity.type === 'website' ? <Globe className="w-4 h-4" /> :
                               activity.type === 'network' ? <BarChart3 className="w-4 h-4" /> :
                               activity.type === 'geo' ? <Activity className="w-4 h-4" /> :
                               <Zap className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{activity.action}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {activity.time}
                              </div>
                            </div>
                          </div>
                          <div className="text-emerald-600 font-semibold text-sm">{activity.reward}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Network Stats */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Users className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Network Overview</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-emerald-700">Monthly Projection</div>
                            <div className="text-xl font-bold text-emerald-600">7.2 SOL</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-emerald-700">USD Value</div>
                            <div className="text-lg font-semibold text-emerald-600">~$450</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">12,847</div>
                          <div className="text-xs text-gray-600">Total Validators</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">3,421</div>
                          <div className="text-xs text-gray-600">Websites Monitored</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Validator Registration Modal */}
        <AnimatePresence>
          {showValidatorModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowValidatorModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <ValidatorRegistration />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowValidatorModal(false)}
                  className="w-full mt-6 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Close
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default Home