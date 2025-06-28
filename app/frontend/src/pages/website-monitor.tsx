import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { formatDate, getContributionIcon, getStatusColor } from '../lib/utils';
import { Globe, Clock, Zap, CheckCircle, XCircle, AlertCircle, Play, Plus, TrendingUp } from 'lucide-react';
import { contributionMethods } from '../lib/mockData';
import { ContributionMethod } from '../types';
import axios from 'axios';

// Mock monitoring sessions for demo
const mockSessions = [
  {
    id: 'session_1',
    url: 'https://mystore.com',
    status: 'monitoring',
    progress: 60,
    timeRemaining: '32 minutes',
    totalDuration: '80 minutes',
    cost: 2.40,
    startedAt: '2025-06-10T14:00:00Z',
    segments: 8,
    completedSegments: 5
  },
  {
    id: 'session_2',
    url: 'https://blog.example.org',
    status: 'completed',
    progress: 100,
    result: 'issues',
    totalDuration: '80 minutes',
    cost: 2.40,
    startedAt: '2025-06-10T13:00:00Z',
    segments: 8,
    completedSegments: 8
  },
  {
    id: 'session_3',
    url: 'https://api.myapp.io',
    status: 'completed',
    progress: 100,
    result: 'success',
    totalDuration: '80 minutes',
    cost: 2.40,
    startedAt: '2025-06-10T12:00:00Z',
    segments: 8,
    completedSegments: 8
  }
];

const WebsiteMonitorPage = () => {
  const [method, setMethod] = useState<ContributionMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [sessions, setSessions] = useState(mockSessions);
  
  // Form state
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [websiteResponse, setWebsiteResponse] = useState<string>();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const foundMethod = contributionMethods.find(m => m.id === 'website-monitor');
    if (foundMethod) {
      setMethod(foundMethod);
    }
    setLoading(false);
  }, []);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const handleStartMonitoring = async () => {
    setError('');

    if (!websiteUrl.trim()) {
      setError('Please enter a website URL');
      return;
    }

    if (!validateUrl(websiteUrl)) {
      setError('Please enter a valid URL (must start with http:// or https://)');
      return;
    }

    setFormLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:3001/add-website/add', {
        url_to_monitor: websiteUrl
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });

      if (response.data) {
        setWebsiteResponse(response.data.message);
        
        // Add new session to UI
        const newSession = {
          id: `session_${Date.now()}`,
          url: websiteUrl,
          status: 'monitoring',
          progress: 0,
          timeRemaining: '80 minutes',
          totalDuration: '80 minutes',
          cost: 2.40,
          startedAt: new Date().toISOString(),
          segments: 8,
          completedSegments: 0
        };

        setSessions([newSession, ...sessions]);
        setWebsiteUrl('');
      }
    } catch (err) {
      setError('Failed to start monitoring. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  if (!mounted || loading || !method) {
    return (
      <Layout title="Website Monitoring">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-600">Loading monitoring dashboard...</div>
          </div>
        </div>
      </Layout>
    );
  }

  const getSessionIcon = (session: any) => {
    switch (session.status) {
      case 'monitoring':
        return <Zap className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'completed':
        return session.result === 'success' 
          ? <CheckCircle className="w-5 h-5 text-emerald-500" />
          : <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSessionStatus = (session: any) => {
    switch (session.status) {
      case 'monitoring':
        return `Monitoring... ${session.timeRemaining} remaining`;
      case 'completed':
        return session.result === 'success' 
          ? 'Monitoring Complete - All Good'
          : 'Monitoring Complete - Issues Detected';
      default:
        return 'Unknown Status';
    }
  };

  return (
    <Layout title={method.name}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{method.name}</h1>
              <p className="text-lg text-gray-600 mt-2">{method.description}</p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/40">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {method.metrics.contributions.toLocaleString()}
              </div>
              <div className="text-gray-600">Total Contributions</div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/40">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {method.metrics.rewards.toFixed(2)} <span className="text-lg font-normal">SOL</span>
              </div>
              <div className="text-gray-600">Rewards Earned</div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/40">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {method.rewardRate.toFixed(3)} <span className="text-lg font-normal">SOL</span>
              </div>
              <div className="text-gray-600">Per Contribution</div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/40">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {method.metrics.lastContribution ? formatDate(method.metrics.lastContribution) : 'Never'}
              </div>
              <div className="text-gray-600">Last Contribution</div>
            </div>
          </div>
        </div>

        {/* New Monitoring Setup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm"
        >
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Play className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Start New Monitoring Session</h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* URL Input Section */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="website-url" className="block text-sm font-medium text-gray-700 mb-3">
                    Website URL
                  </label>
                  <input
                    id="website-url"
                    type="url"
                    placeholder="https://example.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  {websiteResponse && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-blue-800 text-sm">{websiteResponse}</p>
                    </div>
                  )}
                </div>

                {error && (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStartMonitoring}
                  disabled={formLoading}
                  className="w-full bg-black text-white py-4 px-6 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3"
                >
                  {formLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Starting monitoring...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start 80-Minute Monitoring ($2.40)
                    </>
                  )}
                </motion.button>
              </div>

              {/* Info Section */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm font-bold">1</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">8 Monitoring Segments</div>
                      <div className="text-gray-600 text-sm">Each segment monitors for 10 minutes</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm font-bold">2</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Real-time Results</div>
                      <div className="text-gray-600 text-sm">Visual feedback throughout monitoring</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm font-bold">3</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Detailed Report</div>
                      <div className="text-gray-600 text-sm">Complete analysis after 80 minutes</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="text-sm font-medium text-blue-900 mb-2">Pricing</div>
                  <div className="text-2xl font-bold text-blue-600">$0.03/minute</div>
                  <div className="text-blue-700 text-sm">Total: $2.40 for 80 minutes</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Active Monitoring Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Monitoring Sessions</h2>
              <div className="text-sm text-gray-600">
                {sessions.filter(s => s.status === 'monitoring').length} active sessions
              </div>
            </div>

            {sessions.length > 0 ? (
              <div className="space-y-6">
                <AnimatePresence>
                  {sessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className={`border rounded-2xl p-6 ${
                        session.status === 'monitoring'
                          ? 'border-blue-200 bg-blue-50'
                          : session.result === 'success'
                          ? 'border-emerald-200 bg-emerald-50'
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          {getSessionIcon(session)}
                          <div>
                            <div className="font-semibold text-gray-900 text-lg">{session.url}</div>
                            <div className="text-gray-600">{getSessionStatus(session)}</div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Cost</div>
                          <div className="font-semibold text-gray-900">${session.cost.toFixed(2)}</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Progress</span>
                          <span className="text-sm font-medium text-gray-900">
                            {session.completedSegments}/{session.segments} segments
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-300 ${
                              session.status === 'monitoring' 
                                ? 'bg-blue-500' 
                                : session.result === 'success'
                                ? 'bg-emerald-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${session.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Started: {formatDate(session.startedAt)}</span>
                        <span>Duration: {session.totalDuration}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-12">
                <Globe className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Monitoring Sessions</h3>
                <p className="text-gray-600">Start monitoring your first website using the form above.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default WebsiteMonitorPage;