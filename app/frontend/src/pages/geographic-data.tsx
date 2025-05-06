import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { contributionMethods, geographicData } from '../lib/mockData';
import { ContributionMethod } from '../types';
import { Card } from '../components/ui/card';
import { fadeIn, slideUp, staggerContainer } from '../lib/framer-variants';
import { formatDate, getContributionIcon, getStatusColor } from '../lib/utils';

const GeographicDataPage = () => {
  const [method, setMethod] = useState<ContributionMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Set mounted state to handle client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the contribution method data
  useEffect(() => {
    // In a real app, this would be an API call
    const foundMethod = contributionMethods.find(m => m.id === 'geographic-data');
    if (foundMethod) {
      setMethod(foundMethod);
    }
    setLoading(false);
  }, []);

  // Only render on client-side to avoid hydration mismatch
  if (!mounted || loading || !method) {
    return (
      <Layout title="Loading...">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={method.name}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Method header */}
        <motion.div variants={fadeIn} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
              {getContributionIcon(method.icon)}
            </div>
            <h1 className="text-3xl font-bold">{method.name}</h1>
          </div>
          
          <p className="text-muted-foreground max-w-3xl">{method.description}</p>
          
          <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(method.active ? 'active' : 'inactive')}`}>
            {method.active ? 'Active' : 'Inactive'}
          </div>
        </motion.div>

        {/* Stats overview */}
        <motion.div variants={slideUp}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5">
              <div className="text-sm text-muted-foreground mb-1">Contributions</div>
              <div className="text-2xl font-bold">{method.metrics.contributions.toLocaleString()}</div>
            </Card>
            
            <Card className="p-5">
              <div className="text-sm text-muted-foreground mb-1">Rewards Earned</div>
              <div className="text-2xl font-bold">{method.metrics.rewards.toFixed(2)} <span className="text-base font-normal">SOL</span></div>
            </Card>
            
            <Card className="p-5">
              <div className="text-sm text-muted-foreground mb-1">Per Contribution</div>
              <div className="text-2xl font-bold">{method.rewardRate.toFixed(2)} <span className="text-base font-normal">SOL</span></div>
            </Card>
            
            <Card className="p-5">
              <div className="text-sm text-muted-foreground mb-1">Last Contribution</div>
              <div className="text-xl font-bold">
                {method.metrics.lastContribution ? formatDate(method.metrics.lastContribution) : 'Never'}
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Geographic Data Display */}
        <motion.div variants={slideUp} className="mt-8">
          <Card>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Geographic Data Contributions</h3>
              
              {/* Placeholder for map - in a real implementation, this would use a mapping library */}
              <div className="bg-muted rounded-lg h-96 mb-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🗺️</div>
                  <div className="text-muted-foreground">Interactive map coming soon</div>
                  <div className="text-sm text-muted-foreground mt-2">Your geographic data points would be displayed here</div>
                </div>
              </div>
              
              {/* Recent contributions table */}
              <h4 className="text-lg font-medium mb-3">Recent Contributions</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium">Date & Time</th>
                      <th className="text-left p-3 font-medium">Latitude</th>
                      <th className="text-left p-3 font-medium">Longitude</th>
                      <th className="text-left p-3 font-medium">Connection Quality</th>
                    </tr>
                  </thead>
                  <tbody>
                    {geographicData.map((point, index) => (
                      <tr key={index} className="border-b border-border">
                        <td className="p-3 text-sm">{formatDate(point.timestamp)}</td>
                        <td className="p-3 text-sm">{point.latitude.toFixed(4)}</td>
                        <td className="p-3 text-sm">{point.longitude.toFixed(4)}</td>
                        <td className="p-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            point.connectionQuality === 'excellent' ? 'bg-emerald-500/20 text-emerald-400' :
                            point.connectionQuality === 'good' ? 'bg-blue-500/20 text-blue-400' :
                            point.connectionQuality === 'fair' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {point.connectionQuality.charAt(0).toUpperCase() + point.connectionQuality.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default GeographicDataPage;