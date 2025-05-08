import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { UserStats } from '../../types';
import { staggerContainer, scaleIn } from '../../lib/framer-variants';
import { formatNumber } from '../../lib/utils';

interface ContributionStatsProps {
  stats: UserStats;
}

const ContributionStats: React.FC<ContributionStatsProps> = ({ stats }) => {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      {/* Total Contributions */}
      <motion.div variants={scaleIn}>
        <Card className="overflow-hidden border-t-4 border-t-blue-500">
          <CardContent className="p-6">
            <div className="text-4xl font-bold mb-2">
              {stats.totalContributions.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              Total Contributions
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Total Rewards */}
      <motion.div variants={scaleIn}>
        <Card className="overflow-hidden border-t-4 border-t-emerald-500">
          <CardContent className="p-6">
            <div className="text-4xl font-bold mb-2">
              {formatNumber(stats.totalRewards)} <span className="text-lg">SOL</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Rewards Earned
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Devices */}
      <motion.div variants={scaleIn}>
        <Card className="overflow-hidden border-t-4 border-t-purple-500">
          <CardContent className="p-6">
            <div className="text-4xl font-bold mb-2">
              {stats.activeDevices}
            </div>
            <div className="text-sm text-muted-foreground">
              Active Devices
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contribution Streak */}
      <motion.div variants={scaleIn}>
        <Card className="overflow-hidden border-t-4 border-t-amber-500">
          <CardContent className="p-6">
            <div className="text-4xl font-bold mb-2">
              {stats.contributionStreak} <span className="text-lg">days</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Current Streak
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ContributionStats;