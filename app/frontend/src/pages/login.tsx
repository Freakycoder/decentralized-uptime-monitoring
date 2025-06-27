import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  TrendingUp,
  Users,
  Award,
  Shield,
  Zap,
  Globe,
  Activity,
  DollarSign
} from 'lucide-react';

const Login = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Real-time stats simulation
  const [liveStats, setLiveStats] = useState({
    activeUsers: 12847,
    totalRewards: 50000,
    onlineValidators: 3421,
    avgEarnings: 2.4
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      
      if (result.success) {
        router.push('/home');
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: DollarSign,
      title: "Passive Income Generation",
      description: "Earn SOL tokens automatically through data contribution",
      color: "emerald"
    },
    {
      icon: Shield,
      title: "Privacy-First Platform",
      description: "Anonymous data sharing with complete privacy controls",
      color: "blue"
    },
    {
      icon: Zap,
      title: "Real-time Rewards",
      description: "Instant SOL payments directly to your wallet",
      color: "purple"
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Join contributors worldwide in building better internet",
      color: "amber"
    }
  ];

  const stats = [
    { label: "Active Contributors", value: liveStats.activeUsers.toLocaleString(), icon: Users, trend: "+15%" },
    { label: "Total Rewards Paid", value: `${(liveStats.totalRewards / 1000).toFixed(0)}K SOL`, icon: Award, trend: "+8%" },
    { label: "Online Validators", value: liveStats.onlineValidators.toLocaleString(), icon: Activity, trend: "+12%" },
    { label: "Avg Daily Earnings", value: `${liveStats.avgEarnings} SOL`, icon: TrendingUp, trend: "+5%" }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex"
    >
      {/* Left Side - Enhanced Branding */}
      <div className="hidden lg:flex lg:w-3/5 xl:w-2/3 relative overflow-hidden">
        <div className="flex flex-col justify-center px-16 py-12 w-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
          </div>

          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative z-10 max-w-xl"
          >

            {/* Hero Content */}
            <h1 className="text-6xl font-bold text-white mb-8 leading-tight">
              Welcome back to the future of 
              <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent"> data contribution</span>
            </h1>

            {/* Features */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ x: 10 }}
                  className="flex items-start gap-5 p-4 rounded-2xl hover:bg-white/5 transition-all duration-300"
                >
                  <div className={`w-12 h-12 bg-${feature.color}-500/20 rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                  </div>
                  <div>
                    <div className="font-semibold text-white mb-2 text-lg">{feature.title}</div>
                    <div className="text-gray-400">{feature.description}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Enhanced Login Form */}
      <div className="flex-1 lg:w-2/5 xl:w-1/3 flex flex-col justify-center px-8 lg:px-12 py-12 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-50 to-transparent rounded-full blur-3xl"></div>

        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative z-10 mx-auto w-full max-w-sm"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900">DataContrib</span>
              <div className="text-blue-600 text-sm font-medium">Network</div>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome Back</h2>
            <p className="text-gray-500 text-md">Enter your credentials to access your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0, height: 0 }}
                  animate={{ scale: 1, opacity: 1, height: 'auto' }}
                  exit={{ scale: 0.95, opacity: 0, height: 0 }}
                  className="p-4 bg-red-50 border-l-4 border-red-400 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700 font-medium">{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-3">
                Email address
              </label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                  focusedField === 'email' ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all duration-200"
                  required
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                  focusedField === 'password' ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all duration-200"
                  required
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </div>
            </div>
            
            <motion.button
              whileHover={{ 
                scale: 1.02, 
                boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)" 
              }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 shadow-lg"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Signing in...
                </>
              ) : (
                <>
                  <span>Sign in to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-gray-600">Don't have an account? </span>
            <a href="/signup">
              <motion.a 
                whileHover={{ scale: 1.05 }}
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                Sign up now
              </motion.a>
            </a>
          </div>
          {/* Enhanced Security Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="text-emerald-800 font-medium text-sm">Secure Login</div>
                <div className="text-emerald-700 text-xs">Protected by enterprise-grade encryption</div>
              </div>
            </div>
          </motion.div>


          {/* Trust indicators */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-gray-500 mb-3 text-center text-sm">Trusted by contributors worldwide</div>
            <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Secure Platform</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Fair Rewards</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;