import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      <div className="hidden lg:flex lg:w-3/5 xl:w-2/3 relative">
        <div className="flex flex-col justify-center px-16 py-12 w-full bg-white">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-xl"
          >
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-sm transform rotate-45"></div>
              </div>
              <span className="text-2xl font-bold text-gray-900">DataContrib</span>
            </div>

            {/* Hero Content */}
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome back to the future of 
              <span className="bg-teal-100 px-3 py-1 rounded-lg ml-2">data contribution</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Join thousands of contributors earning SOL tokens by sharing valuable digital data. 
              Your device, your rewards.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">12,847</div>
                <div className="text-gray-600">Active Contributors</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">50K+ SOL</div>
                <div className="text-gray-600">Total Rewards Paid</div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-black rounded-full"></div>
                <span className="text-gray-700 text-lg">Earn passive income through data contribution</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-black rounded-full"></div>
                <span className="text-gray-700 text-lg">Real-time rewards in SOL cryptocurrency</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-black rounded-full"></div>
                <span className="text-gray-700 text-lg">Secure, privacy-focused platform</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 lg:w-2/5 xl:w-1/3 flex flex-col justify-center px-8 lg:px-12 py-12 bg-white border-l border-gray-100">
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
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Sign in</h2>
            <p className="text-gray-600 text-lg">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-4 text-sm bg-red-50 text-red-700 rounded-xl border border-red-200"
              >
                {error}
              </motion.div>
            )}
            
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
                <Link href="/forgot-password" className="text-sm text-black hover:text-gray-700 font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 px-4 rounded-xl font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-gray-600">Don't have an account? </span>
            <Link href="/signup" className="text-black font-medium hover:text-gray-700 transition-colors">
              Sign up
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;