// src/components/dashboard/WelcomeBanner.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { Globe, Shield, ArrowRight, Clock, DollarSign, Award, CheckCircle } from 'lucide-react';

const WelcomeBanner: React.FC = () => {
  const router = useRouter();
  const { isValidated } = useAuth();
  const [selectedPath, setSelectedPath] = useState<'user' | 'validator' | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // If user is already validated as validator, show validator-specific welcome
  if (isValidated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden mb-8 rounded-2xl bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-100 p-8"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-blue-400/20 to-emerald-400/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Welcome back, Validator!</h2>
                <p className="text-emerald-600 font-medium">Network Status: Active & Earning</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-xl">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-emerald-700 font-medium text-sm">Live</span>
            </div>
          </div>
          
          <p className="text-lg text-gray-700 mb-8 max-w-3xl">
            You're connected to the validator network and earning rewards by monitoring websites. 
            Your contributions help maintain the reliability of the internet infrastructure.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/40">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="w-6 h-6 text-emerald-600" />
                <span className="font-semibold text-gray-900">Today's Earnings</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">0.24 SOL</div>
              <div className="text-sm text-gray-600">+12% from yesterday</div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/40">
              <div className="flex items-center gap-3 mb-3">
                <Globe className="w-6 h-6 text-blue-600" />
                <span className="font-semibold text-gray-900">Sites Monitored</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">23</div>
              <div className="text-sm text-gray-600">Active monitoring tasks</div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/40">
              <div className="flex items-center gap-3 mb-3">
                <Award className="w-6 h-6 text-purple-600" />
                <span className="font-semibold text-gray-900">Validator Rank</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">#247</div>
              <div className="text-sm text-gray-600">Out of 12,847 validators</div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const handlePathSelection = (path: 'user' | 'validator') => {
    setSelectedPath(path);
    setShowConfirmation(true);
  };

  const confirmSelection = () => {
    if (selectedPath === 'user') {
      router.push('/home/user');
    } else if (selectedPath === 'validator') {
      setShowConfirmation(false);
      alert('Validator registration will be implemented');
    }
  };

  return (
    <div className="mb-8 space-y-8">
      {/* Main welcome message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-8"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Website Monitoring Network
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl">
            Choose how you'd like to participate in our decentralized website monitoring network. 
            You can either monitor your own websites or help others by becoming a validator.
          </p>
        </div>
      </motion.div>

      {!showConfirmation ? (
        /* Path selection cards */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid md:grid-cols-2 gap-8"
        >
          {/* Website Owner Path */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={() => handlePathSelection('user')}
            className={`cursor-pointer rounded-2xl border-2 p-8 transition-all duration-300 ${
              selectedPath === 'user' 
                ? 'border-blue-500 bg-blue-50 shadow-xl' 
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg'
            }`}
          >
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Monitor Your Websites</h3>
              <p className="text-gray-600">
                Get real-time monitoring for your websites with detailed uptime, 
                performance metrics, and instant alerts.
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <span className="text-gray-700">24/7 uptime monitoring</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <span className="text-gray-700">Pay per monitoring hours</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <span className="text-gray-700">Real-time performance insights</span>
              </div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-sm text-gray-600">Starting from</div>
              <div className="text-2xl font-bold text-blue-600">$0.01/hour</div>
            </div>
          </motion.div>

          {/* Validator Path */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={() => handlePathSelection('validator')}
            className={`cursor-pointer rounded-2xl border-2 p-8 transition-all duration-300 ${
              selectedPath === 'validator' 
                ? 'border-emerald-500 bg-emerald-50 shadow-xl' 
                : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-lg'
            }`}
          >
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Become a Validator</h3>
              <p className="text-gray-600">
                Earn SOL rewards by helping monitor websites across the network. 
                Contribute your computing resources and get paid.
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="text-gray-700">Earn SOL rewards</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="text-gray-700">Passive income generation</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="text-gray-700">Support network infrastructure</span>
              </div>
            </div>

            <div className="text-center p-4 bg-emerald-50 rounded-xl">
              <div className="text-sm text-gray-600">Potential earnings</div>
              <div className="text-2xl font-bold text-emerald-600">0.05+ SOL/day</div>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        /* Confirmation step */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-2xl border-2 border-amber-200 p-8">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
                {selectedPath === 'user' ? (
                  <Globe className="h-8 w-8 text-amber-600" />
                ) : (
                  <Shield className="h-8 w-8 text-amber-600" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirm Your Choice</h3>
            </div>
            
            <div className="text-center space-y-4 mb-8">
              <p className="text-lg text-gray-700">
                You've selected: <strong>
                  {selectedPath === 'user' ? 'Website Monitoring' : 'Validator Network'}
                </strong>
              </p>
              <p className="text-gray-600">
                {selectedPath === 'user' 
                  ? 'You\'ll be able to add websites for monitoring and pay for the service.'
                  : 'You\'ll join the validator network and earn rewards by monitoring websites.'
                }
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
              <div className="flex gap-4">
                <div className="text-amber-600 text-2xl">⚠️</div>
                <div>
                  <div className="font-semibold text-amber-800 mb-2">Important: This choice is permanent</div>
                  <div className="text-amber-700 text-sm">
                    Once you select a path, you cannot switch to the other option. 
                    Choose carefully based on your needs.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowConfirmation(false)}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Go Back
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={confirmSelection}
                className={`px-8 py-3 rounded-xl text-white font-medium transition-colors ${
                  selectedPath === 'user' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {selectedPath === 'user' ? 'Start Monitoring' : 'Join Validator Network'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WelcomeBanner;