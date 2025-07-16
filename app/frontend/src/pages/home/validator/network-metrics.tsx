import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import AppLayout from '../../../components/AppLayout';
import { useAuth } from '../../../contexts/AuthContext';
import SessionManager from '../../../services/SessionManager';
import { 
  BarChart3,
  ArrowLeft,
  Wallet,
  Clock,
  Activity,
  Wifi,
  Zap
} from 'lucide-react';

const NetworkMetricsPage = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, isValidated } = useAuth();
  const [walletAddress, setWalletAddress] = useState('');

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

  if (!mounted) {
    return (
      <AppLayout title="Network Metrics">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-600">Loading...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Network Metrics">
      <div className="space-y-6">
        {/* Header */}
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
              <h1 className="text-2xl font-bold text-gray-900">Network Metrics</h1>
              <p className="text-gray-600">Monitor network performance and connectivity</p>
            </div>
          </div>
          
          {walletAddress && (
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
              <Wallet className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{walletAddress}</span>
            </div>
          )}
        </div>

        {/* Coming Soon Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Network Performance Monitoring</h3>
                <p className="text-sm text-gray-600">Track network latency, bandwidth, and connectivity metrics</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-center py-16">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-600 mb-6">Network metrics monitoring is currently under development. This feature will allow you to:</p>
                
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span>Monitor network latency and response times</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Wifi className="w-4 h-4 text-blue-500" />
                    <span>Track bandwidth utilization and connectivity</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span>Earn rewards for contributing network data</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <span>View detailed performance analytics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default NetworkMetricsPage;