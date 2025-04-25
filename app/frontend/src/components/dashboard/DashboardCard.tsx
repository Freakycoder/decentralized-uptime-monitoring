import { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { ContributionMethod } from '../../types';
import { cardHover } from '../../lib/framer-variants';
import { formatDate, getContributionIcon, getStatusColor } from '../../lib/utils';

interface DashboardCardProps {
  method: ContributionMethod;
}


const DashboardCard: React.FC<DashboardCardProps> = ({ method }) => {
  return (
    <Link href={`/contribution/${method.id}`} className="block h-full">
      <motion.div
        initial="initial"
        whileHover="hover"
        variants={cardHover}
        className="h-full"
      >
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-0">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xl">
                  {getContributionIcon(method.icon)}
                </div>
                <h3 className="font-semibold text-lg">{method.name}</h3>
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(method.active ? 'active' : 'inactive')}`}>
                {method.active ? 'Active' : 'Inactive'}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {method.description}
            </p>
          </CardHeader>
          
          <CardContent className="py-4 flex-grow">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/50 rounded-md p-3">
                <div className="text-lg font-semibold">
                  {method.metrics.contributions.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  Contributions
                </div>
              </div>
              
              <div className="bg-secondary/50 rounded-md p-3">
                <div className="text-lg font-semibold">
                  {method.metrics.rewards.toFixed(2)} SOL
                </div>
                <div className="text-xs text-muted-foreground">
                  Rewards
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="pt-2 text-sm text-muted-foreground border-t border-border flex justify-between">
            <div>
              {method.rewardRate.toFixed(2)} SOL per contribution
            </div>
            <div>
              {method.metrics.lastContribution 
                ? `Last: ${formatDate(method.metrics.lastContribution)}` 
                : 'Never contributed'}
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </Link>
  );
};

export default DashboardCard;