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
      className="min-h-screen relative overflow-hidden"
    >
      {/* Unified Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-blue-900 via-purple-900 to-blue-50">
        {/* Animated background elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
        <div className="absolute top-3/4 right-1/3 w-36 h-36 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-3000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Brand Content */}
        <div className="hidden lg:flex lg:w-3/5 items-center">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="px-16 py-12 max-w-2xl"
          >
      

            {/* Hero Content */}
            <h1 className="text-4xl lg:text-4xl font-bold text-white mb-8 leading-tight">
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
                  className="flex items-start gap-5 p-4 rounded-2xl hover:bg-white/5 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className={`w-12 h-12 bg-${feature.color}-500/20 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/10`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                  </div>
                  <div>
                    <div className="font-semibold text-white mb-2 text-lg">{feature.title}</div>
                    <div className="text-gray-300">{feature.description}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Side - Floating Glass Form */}
        <div className="flex-1 lg:w-2/5 xl:w-1/3 flex items-center justify-start lg:pr-20 py-12">
          <motion.div 
            initial={{ x: 50, opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="w-full max-w-md"
          >
            {/* Glass Container */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
              {/* Mobile Logo */}
              <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">DataContrib</span>
                  <div className="text-blue-300 text-sm font-medium">Network</div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-3xl font-bold text-white mb-3">Welcome Back</h2>
                <p className="text-white/70">Enter your credentials to access your dashboard</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0, height: 0 }}
                      animate={{ scale: 1, opacity: 1, height: 'auto' }}
                      exit={{ scale: 0.95, opacity: 0, height: 0 }}
                      className="p-4 bg-red-500/20 border border-red-400/30 rounded-xl backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-300" />
                        <span className="text-red-200 font-medium">{error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-3">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                      focusedField === 'email' ? 'text-blue-300' : 'text-white/60'
                    }`} />
                    <input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 backdrop-blur-sm transition-all duration-200"
                      required
                    />
                  </div>
                </div>
                
                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label htmlFor="password" className="block text-sm font-medium text-white/90">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                      focusedField === 'password' ? 'text-blue-300' : 'text-white/60'
                    }`} />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 backdrop-blur-sm transition-all duration-200"
                      required
                    />
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
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
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 shadow-lg backdrop-blur-sm"
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

              <div className="mt-6 text-center">
                <span className="text-white/70">Don't have an account? </span>
                <Link href="/signup">
                  <motion.span 
                    whileHover={{ scale: 1.05 }}
                    className="text-blue-300 font-medium hover:text-blue-200 transition-colors cursor-pointer"
                  >
                    Sign up now
                  </motion.span>
                </Link>
              </div>

              {/* Enhanced Security Note */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-6 p-4 bg-emerald-500/20 border border-emerald-400/30 rounded-xl backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-300" />
                  <div>
                    <div className="text-emerald-200 font-medium text-sm">Secure Login</div>
                    <div className="text-emerald-300/80 text-xs">Protected by enterprise-grade encryption</div>
                  </div>
                </div>
              </motion.div>

            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;