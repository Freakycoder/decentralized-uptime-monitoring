// src/components/dashboard/ContributionStats.tsx
import { motion } from 'framer-motion';
import { UserStats } from '../../types';
import { formatNumber } from '../../lib/utils';
import { TrendingUp, Coins, Monitor, Zap } from 'lucide-react';

interface ContributionStatsProps {
  stats: UserStats;
}

const ContributionStats: React.FC<ContributionStatsProps> = ({ stats }) => {
  const statsCards = [
    {
      title: 'Total Contributions',
      value: stats.totalContributions.toLocaleString(),
      subtitle: 'Data points shared',
      icon: TrendingUp,
      color: 'blue',
      trend: '+12.5%',
      trendUp: true
    },
    {
      title: 'Rewards Earned',
      value: formatNumber(stats.totalRewards),
      suffix: 'SOL',
      subtitle: 'Total earnings',
      icon: Coins,
      color: 'emerald',
      trend: '+0.24 SOL',
      trendUp: true
    },
    {
      title: 'Active Devices',
      value: stats.activeDevices.toString(),
      subtitle: 'Currently contributing',
      icon: Monitor,
      color: 'purple',
      trend: 'All online',
      trendUp: true
    },
    {
      title: 'Contribution Streak',
      value: stats.contributionStreak.toString(),
      suffix: 'days',
      subtitle: 'Current streak',
      icon: Zap,
      color: 'amber',
      trend: '+1 day',
      trendUp: true
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'text-blue-600',
        iconBg: 'bg-blue-100',
        trend: 'text-blue-600'
      },
      emerald: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        icon: 'text-emerald-600',
        iconBg: 'bg-emerald-100',
        trend: 'text-emerald-600'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        icon: 'text-purple-600',
        iconBg: 'bg-purple-100',
        trend: 'text-purple-600'
      },
      amber: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: 'text-amber-600',
        iconBg: 'bg-amber-100',
        trend: 'text-amber-600'
      }
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
    >
      {statsCards.map((stat, index) => {
        const colorClasses = getColorClasses(stat.color);
        const IconComponent = stat.icon;
        
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + (index * 0.1) }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`relative overflow-hidden rounded-2xl border ${colorClasses.border} ${colorClasses.bg} p-6 transition-all duration-300 hover:shadow-lg`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${colorClasses.iconBg} flex items-center justify-center`}>
                <IconComponent className={`w-6 h-6 ${colorClasses.icon}`} />
              </div>
              <div className={`text-sm font-medium ${colorClasses.trend} bg-white/60 px-2 py-1 rounded-lg`}>
                {stat.trendUp ? '↗' : '↘'} {stat.trend}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                {stat.suffix && (
                  <span className="text-lg font-medium text-gray-600">{stat.suffix}</span>
                )}
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-900">{stat.title}</div>
                <div className="text-xs text-gray-600">{stat.subtitle}</div>
              </div>
            </div>

            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-br from-white/40 to-transparent blur-xl"></div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default ContributionStats;