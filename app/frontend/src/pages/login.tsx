import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle, 
  DollarSignIcon,
  LockIcon
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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 flex"
    >
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-7/12 xl:w-7/12 relative">
        <div className="flex flex-col justify-center px-16 py-12 w-full bg-white">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-xl"
          >

            {/* Hero Content */}
            <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome back to the future of
              <span className="bg-teal-100 px-3 py-1 rounded-lg ml-2">data contribution</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Access your dashboard and continue earning SOL tokens through your valuable 
              data contributions. Your passive income generator awaits.
            </p>

            {/* Features */}
            <div className="space-y-8 mb-12">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                 <DollarSignIcon></DollarSignIcon>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-2 text-lg">Passive Income Generation</div>
                  <div className="text-gray-600">Earn SOL tokens automatically through data contribution</div>
                </div>
              </div>
              
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <LockIcon></LockIcon>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-2 text-lg">Privacy-First Platform</div>
                  <div className="text-gray-600">Anonymous data sharing with complete privacy controls</div>
                </div>
              </div>
              
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-2 text-lg">Real-time Rewards</div>
                  <div className="text-gray-600">Instant SOL payments directly to your wallet</div>
                </div>
              </div>
              
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🌐</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-2 text-lg">Global Network</div>
                  <div className="text-gray-600">Join contributors worldwide in building better internet</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 lg:w-5/12 xl:w-5/12 flex flex-col justify-center px-8 lg:px-12 py-12 bg-white border-l border-gray-100">
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mx-auto w-full max-w-sm"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-sm transform rotate-45"></div>
            </div>
            <span className="text-2xl font-bold text-gray-900">DataContrib</span>
          </div>

          <div className="mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Welcome Back</h2>
            <p className="text-gray-500 text-lg">Enter your credentials to access your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0, height: 0 }}
                  animate={{ scale: 1, opacity: 1, height: 'auto' }}
                  exit={{ scale: 0.95, opacity: 0, height: 0 }}
                  className="p-4 text-sm bg-red-50 text-red-700 rounded-xl border border-red-200"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-3">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
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
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 px-4 rounded-xl font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3"
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
            <Link href="/signup" className="text-black font-medium hover:text-gray-700 transition-colors">
              Sign up now
            </Link>
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
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;
