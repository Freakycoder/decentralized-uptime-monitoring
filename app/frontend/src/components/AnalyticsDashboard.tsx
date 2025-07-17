import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { BentoGrid, BentoGridItem } from './ui/bento-grid';
import { Spotlight } from './ui/spotlight';
import { 
  TrendingUp, 
  Activity, 
  Zap,
  Globe,
  Server,
  MapPin,
  DollarSign,
  BarChart3,
  ChevronRight,
  ArrowUpRight,
  Target,
  Plus,
  Check,
  AlertCircle
} from 'lucide-react';
import api from '../lib/axios';
import ValidatorRegistration from './dashboard/ValidatorRegistration';

interface AnalyticsDashboardProps {
  userType: 'user' | 'validator';
}

const AnimatedCounter = ({ end, duration = 2000 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
};

const GlowingCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    className={`relative p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08] shadow-2xl ${className}`}
    whileHover={{ y: -8, scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300, damping: 10 }}
  >
    <div className="absolute -inset-px bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative z-10">{children}</div>
  </motion.div>
);

const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  gradient,
  description 
}: { 
  title: string; 
  value: string; 
  change: string; 
  icon: any; 
  gradient: string;
  description?: string;
}) => (
  <GlowingCard className="group">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex items-center space-x-1 text-emerald-400 text-sm font-medium">
        <ArrowUpRight className="w-4 h-4" />
        <span>{change}</span>
      </div>
    </div>
    <div className="space-y-2">
      <h3 className="text-3xl font-bold text-white">{value}</h3>
      <p className="text-white/60 text-sm font-medium">{title}</p>
      {description && <p className="text-white/40 text-xs">{description}</p>}
    </div>
  </GlowingCard>
);

const InteractiveChart = () => {
  const data = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    value: Math.floor(Math.random() * 100) + 20,
  }));

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="h-48 flex items-end justify-between space-x-2 p-4">
      {data.map((item, index) => (
        <motion.div
          key={index}
          className="flex-1 bg-gradient-to-t from-blue-500 to-purple-600 rounded-t-lg relative group cursor-pointer"
          initial={{ height: 0 }}
          animate={{ height: `${(item.value / maxValue) * 100}%` }}
          transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
          whileHover={{ scale: 1.05, y: -4 }}
        >
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-white whitespace-nowrap">
            {item.month}: {item.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const ActivityFeed = () => {
  const activities = [
    { id: 1, action: "Website monitoring completed", site: "example.com", reward: "+0.05 SOL", time: "2m ago", type: "success" },
    { id: 2, action: "Network metrics submitted", site: "api.service.io", reward: "+0.08 SOL", time: "5m ago", type: "success" },
    { id: 3, action: "Geographic data updated", site: "global.network", reward: "+0.04 SOL", time: "12m ago", type: "info" },
    { id: 4, action: "Computing resources shared", site: "distributed.cloud", reward: "+0.12 SOL", time: "18m ago", type: "success" },
  ];

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
        >
          <div className="flex items-center space-x-4">
            <div className={`w-2 h-2 rounded-full ${activity.type === 'success' ? 'bg-emerald-400' : 'bg-blue-400'} animate-pulse`} />
            <div>
              <p className="text-white text-sm font-medium">{activity.action}</p>
              <p className="text-white/60 text-xs">{activity.site} · {activity.time}</p>
            </div>
          </div>
          <div className="text-emerald-400 text-sm font-bold group-hover:text-emerald-300">
            {activity.reward}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const WebsiteMonitor = () => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get user ID from localStorage
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      setUserId(storedUserId);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteUrl.trim() || !userId) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await api.post('/add-website/add', {
        user_id: userId,
        url_to_monitor: websiteUrl.trim()
      });

      if (response.data.status_code === 200) {
        setSubmitStatus('success');
        setWebsiteUrl('');
        setTimeout(() => setSubmitStatus('idle'), 3000);
      } else {
        setSubmitStatus('error');
        setErrorMessage(response.data.message || 'Failed to add website');
      }
    } catch (error: any) {
      setSubmitStatus('error');
      setErrorMessage(error.response?.data?.message || 'Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlowingCard className="group">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Add Website to Monitor</h3>
          <p className="text-white/60 text-sm">Submit a website URL for global monitoring and earn SOL tokens</p>
        </div>
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
          <Globe className="w-6 h-6 text-white" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-white/70 uppercase tracking-wide font-medium mb-2 block">
            Website URL
          </label>
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.com"
            required
            className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
          />
        </div>

        <motion.button
          type="submit"
          disabled={isSubmitting || !websiteUrl.trim()}
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            w-full py-3 px-6 rounded-xl font-medium text-white transition-all duration-300 flex items-center justify-center space-x-2
            ${isSubmitting || !websiteUrl.trim()
              ? 'bg-white/10 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-blue-500/25'
            }
          `}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Adding Website...</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Add Website</span>
            </>
          )}
        </motion.button>

        {/* Status Messages */}
        <AnimatePresence>
          {submitStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2 p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">Website added successfully!</span>
            </motion.div>
          )}

          {submitStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2 p-3 rounded-lg bg-red-500/20 border border-red-500/30"
            >
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm font-medium">{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </GlowingCard>
  );
};

const AnalyticsDashboard = ({ userType }: AnalyticsDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showValidatorModal, setShowValidatorModal] = useState(false);

  if (userType === 'user') {
    return (
      <div className="relative">
        {/* Hero Section with Spotlight */}
        <div className="relative mb-12 overflow-hidden">
          <Spotlight className="absolute -top-40 left-0 md:left-60 md:-top-20" fill="white" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-white/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-3xl" />
            
            <div className="relative z-10 max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-2 mb-6"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-blue-400 text-sm font-bold tracking-wider uppercase">DEPIN Network</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight mb-6"
              >
                Shape the Future of
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  Decentralized Infrastructure
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-white/80 leading-relaxed mb-8 max-w-2xl"
              >
                Join thousands of validators earning SOL tokens while building the world's most resilient 
                and transparent data infrastructure network.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowValidatorModal(true)}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-bold text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 flex items-center space-x-2"
                >
                  <span>Become a Validator</span>
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white font-medium text-lg hover:bg-white/20 transition-all duration-300"
                >
                  Learn More
                </motion.button>
              </motion.div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-1/4 right-12 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-xl" />
            <div className="absolute bottom-1/4 left-12 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-xl" />
          </motion.div>
        </div>

        {/* Website Monitor Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <WebsiteMonitor />
        </motion.div>

        {/* Features Bento Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <BentoGrid className="max-w-6xl mx-auto">
            <BentoGridItem
              title="Website Monitoring"
              description="Monitor global website uptime and performance. Earn up to $2.40 per monitoring session."
              header={
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/10 backdrop-blur-sm items-center justify-center">
                  <Globe className="w-12 h-12 text-blue-400" />
                </div>
              }
              className="md:col-span-2 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/20"
              icon={<Globe className="h-4 w-4 text-blue-400" />}
            />
            
            <BentoGridItem
              title="Network Analytics"
              description="Contribute to network performance data collection and analysis."
              header={
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 backdrop-blur-sm items-center justify-center">
                  <Activity className="w-12 h-12 text-purple-400" />
                </div>
              }
              className="md:col-span-1 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/20"
              icon={<Activity className="h-4 w-4 text-purple-400" />}
            />

            <BentoGridItem
              title="Geographic Data"
              description="Provide location-based infrastructure insights across the globe."
              header={
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/10 backdrop-blur-sm items-center justify-center">
                  <MapPin className="w-12 h-12 text-emerald-400" />
                </div>
              }
              className="md:col-span-1 bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-500/20"
              icon={<MapPin className="h-4 w-4 text-emerald-400" />}
            />

            <BentoGridItem
              title="Computing Resources"
              description="Share CPU, memory, and storage resources for distributed computing tasks."
              header={
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-white/10 backdrop-blur-sm items-center justify-center">
                  <Server className="w-12 h-12 text-orange-400" />
                </div>
              }
              className="md:col-span-2 bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/20"
              icon={<Server className="h-4 w-4 text-orange-400" />}
            />
          </BentoGrid>
        </motion.div>

        {/* Global Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Global Network Stats</h2>
            <p className="text-white/60 text-lg">Real-time data from our worldwide validator network</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <GlowingCard className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                <AnimatedCounter end={1247} />
              </div>
              <p className="text-white/60 text-sm">Active Validators</p>
            </GlowingCard>

            <GlowingCard className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                <AnimatedCounter end={89} />%
              </div>
              <p className="text-white/60 text-sm">Network Uptime</p>
            </GlowingCard>

            <GlowingCard className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                <AnimatedCounter end={156} />K
              </div>
              <p className="text-white/60 text-sm">Data Points</p>
            </GlowingCard>

            <GlowingCard className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                $<AnimatedCounter end={2.4} />M
              </div>
              <p className="text-white/60 text-sm">Rewards Paid</p>
            </GlowingCard>
          </div>
        </motion.div>

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
                className="bg-white rounded-2xl border border-gray-200 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <ValidatorRegistration onComplete={() => setShowValidatorModal(false)} />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowValidatorModal(false)}
                  className="w-full mt-6 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
                >
                  Close
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Validator Dashboard
  return (
    <div className="relative">
      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex space-x-2 mb-8 p-2 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 max-w-md"
      >
        {['overview', 'performance', 'earnings'].map((tab) => (
          <motion.button
            key={tab}
            onClick={() => setActiveTab(tab)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300 flex-1 relative overflow-hidden
              ${activeTab === tab 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                : 'text-white/70 hover:text-white hover:bg-white/10'
              }
            `}
          >
            {activeTab === tab && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl"
                layoutId="activeTab"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10 capitalize">{tab}</span>
          </motion.button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Earnings"
                value="52.37 SOL"
                change="+12.5%"
                icon={DollarSign}
                gradient="from-emerald-500 to-teal-600"
                description="Last 30 days"
              />
              <MetricCard
                title="Active Sessions"
                value="8"
                change="+25%"
                icon={Activity}
                gradient="from-blue-500 to-cyan-600"
                description="Currently running"
              />
              <MetricCard
                title="Network Score"
                value="98.5%"
                change="+2.1%"
                icon={Target}
                gradient="from-purple-500 to-pink-600"
                description="Quality rating"
              />
              <MetricCard
                title="Total Contributions"
                value="1,247"
                change="+156"
                icon={TrendingUp}
                gradient="from-orange-500 to-red-600"
                description="This week"
              />
            </div>

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Performance Chart */}
              <GlowingCard>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Performance Trends</h3>
                  <div className="flex items-center space-x-2 text-sm text-white/60">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                    <span>Sessions Completed</span>
                  </div>
                </div>
                <InteractiveChart />
                <div className="mt-4 flex items-center justify-between text-sm text-white/60">
                  <span>Peak performance: Thursday</span>
                  <span>Avg: 67 sessions/day</span>
                </div>
              </GlowingCard>

              {/* Activity Feed */}
              <GlowingCard>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Recent Activity</h3>
                  <div className="flex items-center space-x-2 text-sm text-emerald-400">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span>Live</span>
                  </div>
                </div>
                <ActivityFeed />
              </GlowingCard>
            </div>

            {/* Network Participation */}
            <GlowingCard>
              <h3 className="text-xl font-bold text-white mb-6">Network Participation</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: "Website Monitoring", progress: 87, color: "from-blue-500 to-cyan-500" },
                  { name: "Network Metrics", progress: 62, color: "from-purple-500 to-pink-500" },
                  { name: "Geographic Data", progress: 45, color: "from-emerald-500 to-teal-500" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-medium">{item.name}</span>
                      <span className="text-white/60 text-sm">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ delay: index * 0.2 + 0.5, duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlowingCard>
          </motion.div>
        )}

        {activeTab === 'performance' && (
          <motion.div
            key="performance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <GlowingCard>
                <h3 className="text-xl font-bold text-white mb-6">Session Performance</h3>
                <InteractiveChart />
              </GlowingCard>
              
              <GlowingCard>
                <h3 className="text-xl font-bold text-white mb-6">Quality Metrics</h3>
                <div className="space-y-4">
                  {[
                    { metric: "Uptime Score", value: "99.2%", trend: "+0.3%" },
                    { metric: "Response Time", value: "12ms", trend: "-2ms" },
                    { metric: "Data Accuracy", value: "98.7%", trend: "+1.2%" },
                    { metric: "Reliability", value: "97.5%", trend: "+0.8%" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <span className="text-white/80">{item.metric}</span>
                      <div className="text-right">
                        <div className="text-white font-semibold">{item.value}</div>
                        <div className="text-emerald-400 text-sm">{item.trend}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlowingCard>
            </div>
          </motion.div>
        )}

        {activeTab === 'earnings' && (
          <motion.div
            key="earnings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="Today's Earnings"
                value="2.15 SOL"
                change="+15%"
                icon={DollarSign}
                gradient="from-emerald-500 to-teal-600"
              />
              <MetricCard
                title="This Week"
                value="14.73 SOL"
                change="+8%"
                icon={BarChart3}
                gradient="from-blue-500 to-cyan-600"
              />
              <MetricCard
                title="Average per Session"
                value="0.045 SOL"
                change="+3%"
                icon={TrendingUp}
                gradient="from-purple-500 to-pink-600"
              />
            </div>

            <GlowingCard>
              <h3 className="text-xl font-bold text-white mb-6">Earnings Breakdown</h3>
              <div className="space-y-4">
                {[
                  { source: "Website Monitoring", amount: "28.40 SOL", percentage: 54 },
                  { source: "Network Metrics", amount: "15.20 SOL", percentage: 29 },
                  { source: "Geographic Data", amount: "8.77 SOL", percentage: 17 }
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white">{item.source}</span>
                      <span className="text-emerald-400 font-semibold">{item.amount}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ delay: index * 0.2, duration: 1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlowingCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnalyticsDashboard;