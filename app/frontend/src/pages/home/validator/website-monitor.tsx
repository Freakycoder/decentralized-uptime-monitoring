import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import AppLayout from '../../../components/AppLayout';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  Plus,
  CheckCircle,
  Monitor,
  Activity,
  AlertCircle,
  ArrowLeft,
  Wallet
} from 'lucide-react';
import axios from 'axios';
import SessionManager from '../../../services/SessionManager';

const WebsiteMonitorPage = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, isValidated } = useAuth();
  const [walletAddress, setWalletAddress] = useState('');
  
  // Website monitoring form state
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setMounted(true);
    
    // Redirect non-validators to user dashboard
    if (!isValidated) {
      router.push('/home/user');
      return;
    }
    
    // Load wallet address for validators
    const userData = SessionManager.getLocalUserData();
    if (userData.validatorId) {
      setWalletAddress(`0x${userData.validatorId.slice(0, 4)}...${userData.validatorId.slice(-4)}`);
    }
  }, [router, isValidated]);

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
      <AppLayout title="Website Monitor">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#e1e1e1] border-t-[#5E6AD2] rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-[#6B7280] text-[14px]">Loading...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Website Monitor">
      <div className="space-y-6">
        {/* Header with Wallet Address */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/home/validator')}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Website Monitoring</h1>
              <p className="text-gray-600">Monitor websites for uptime and performance</p>
            </div>
          </div>
          
          {walletAddress && (
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
              <Wallet className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{walletAddress}</span>
            </div>
          )}
        </div>

        {/* Website Monitoring Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          {/* Header */}
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Monitor className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Add Website for Monitoring</h3>
                <p className="text-sm text-gray-600">Enter website URLs to monitor their uptime and performance</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Add Website Form */}
            <div className="space-y-4">
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
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  {success}
                </div>
              )}
            </div>

            {/* Monitoring Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Monitoring Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Check Interval:</span>
                  <span className="font-medium text-gray-900">10 minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Session Duration:</span>
                  <span className="font-medium text-gray-900">80 minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Reward per Session:</span>
                  <span className="font-medium text-emerald-600">$2.40</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">How Website Monitoring Works</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Add websites you want to monitor for uptime and performance</li>
                <li>• Our network will check your websites every 10 minutes</li>
                <li>• Earn SOL tokens for contributing to the monitoring network</li>
                <li>• Receive notifications when websites go down or have issues</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default WebsiteMonitorPage;