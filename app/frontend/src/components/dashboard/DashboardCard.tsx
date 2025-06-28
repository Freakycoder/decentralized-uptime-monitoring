import Link from 'next/link';
import { motion } from 'framer-motion';
import { ContributionMethod } from '../../types';
import { formatDate, getContributionIcon } from '../../lib/utils';
import { ArrowRight, Activity, Clock, Coins } from 'lucide-react';

interface DashboardCardProps {
  method: ContributionMethod;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ method }) => {
  const getMethodColor = (methodId: string) => {
    const colors = {
      'website-monitor': {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'text-blue-600',
        iconBg: 'bg-blue-100',
        accent: 'text-blue-600'
      },
      'network-metrics': {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        icon: 'text-emerald-600',
        iconBg: 'bg-emerald-100',
        accent: 'text-emerald-600'
      },
      'compute-resources': {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        icon: 'text-purple-600',
        iconBg: 'bg-purple-100',
        accent: 'text-purple-600'
      },
      'geographic-data': {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: 'text-amber-600',
        iconBg: 'bg-amber-100',
        accent: 'text-amber-600'
      },
      'app-usage': {
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        icon: 'text-rose-600',
        iconBg: 'bg-rose-100',
        accent: 'text-rose-600'
      }
    };
    return colors[methodId as keyof typeof colors] || colors['website-monitor'];
  };

  const colorClasses = getMethodColor(method.id);

  return (
    <Link href={`/${method.id}`}>
      <motion.div
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`relative overflow-hidden rounded-2xl border ${colorClasses.border} ${colorClasses.bg} p-6 transition-all duration-300 hover:shadow-xl cursor-pointer group h-full`}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-white/40 to-transparent blur-2xl"></div>
        
        {/* Header */}
        <div className="relative z-10 flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${colorClasses.iconBg} flex items-center justify-center`}>
              <span className="text-2xl">{getContributionIcon(method.icon)}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{method.name}</h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${method.active ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                <span className={`text-sm font-medium ${method.active ? 'text-emerald-600' : 'text-gray-500'}`}>
                  {method.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            whileHover={{ opacity: 1, x: 0 }}
            className="opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <ArrowRight className={`w-6 h-6 ${colorClasses.accent}`} />
          </motion.div>
        </div>
        
        {/* Description */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          {method.description}
        </p>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Contributions</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {method.metrics.contributions.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Rewards</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {method.metrics.rewards.toFixed(2)} <span className="text-base font-normal text-gray-600">SOL</span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/40">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${colorClasses.accent}`}>
              {method.rewardRate.toFixed(3)} SOL
            </span>
            <span className="text-xs text-gray-600">per contribution</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>
              {method.metrics.lastContribution 
                ? formatDate(method.metrics.lastContribution)
                : 'Never'
              }
            </span>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
      </motion.div>
    </Link>
  );
};

export default DashboardCard;