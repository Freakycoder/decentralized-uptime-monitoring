import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '../../components/AppLayout';
import AnalyticsDashboard from '../../components/AnalyticsDashboard';
import ValidatorRegistration from '../../components/dashboard/ValidatorRegistration';
import { useAuth } from '../../contexts/AuthContext';

const UserDashboard = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, isValidated } = useAuth();
  const [showValidatorModal, setShowValidatorModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Redirect validators to validator dashboard
    if (isValidated) {
      router.push('/home/validator');
      return;
    }
    
    // Check if validator registration should be shown
    if (router.query.showValidator === 'true') {
      setShowValidatorModal(true);
      // Remove query param
      router.replace('/home/user', undefined, { shallow: true });
    }
  }, [router, isValidated]);

  if (!mounted) {
    return (
      <AppLayout title="Dashboard">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#e1e1e1] border-t-[#5E6AD2] rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-[#6B7280] text-[14px]">Loading dashboard...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard">
      <AnalyticsDashboard userType="user" />

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
              className="bg-white rounded-lg border border-[#e1e1e1] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <ValidatorRegistration onComplete={() => setShowValidatorModal(false)} />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowValidatorModal(false)}
                className="w-full mt-6 bg-[#f3f4f6] text-[#6B7280] py-3 rounded-lg font-medium hover:bg-[#e5e7eb] transition-colors text-[14px]"
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default UserDashboard;