import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AppLayout from '../../components/AppLayout';
import AnalyticsDashboard from '../../components/AnalyticsDashboard';
import { useAuth } from '../../contexts/AuthContext';

const ValidatorDashboard = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, isValidated } = useAuth();

  useEffect(() => {
    setMounted(true);
    
    // Redirect non-validators to user dashboard
    if (!isValidated) {
      router.push('/home/user');
      return;
    }
  }, [router, isValidated]);

  if (!mounted) {
    return (
      <AppLayout title="Validator Dashboard">
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
    <AppLayout title="Validator Dashboard">
      <AnalyticsDashboard userType="validator" />
    </AppLayout>
  );
};

export default ValidatorDashboard;