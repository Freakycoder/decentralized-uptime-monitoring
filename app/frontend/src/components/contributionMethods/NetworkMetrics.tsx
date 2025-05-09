import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { NetworkMetricsData } from '../../types';
import { fadeIn, slideUp, pulseAnimation } from '../../lib/framer-variants';
import { formatDate, formatNumber } from '../../lib/utils';

// Mock data for network metrics
const mockNetworkData: NetworkMetricsData[] = [
  {
    downloadSpeed: 95.6,
    uploadSpeed: 12.3,
    latency: 18,
    jitter: 2.4,
    packetLoss: 0.02,
    timestamp: '2025-04-20T10:15:23Z',
  },
  {
    downloadSpeed: 88.2,
    uploadSpeed: 10.5,
    latency: 22,
    jitter: 3.1,
    packetLoss: 0.05,
    timestamp: '2025-04-19T16:42:17Z',
  },
  {
    downloadSpeed: 105.4,
    uploadSpeed: 15.8,
    latency: 15,
    jitter: 1.8,
    packetLoss: 0.01,
    timestamp: '2025-04-18T09:27:55Z',
  },
];

const NetworkMetrics: React.FC = () => {
  const [networkData, setNetworkData] = useState<NetworkMetricsData[]>(mockNetworkData);
  const [isRunningTest, setIsRunningTest] = useState(false);

  // Run a new network test
  const runNetworkTest = () => {
    if (isRunningTest) return;
    
    setIsRunningTest(true);
    
    // Simulate a network test with a 3-second delay
    setTimeout(() => {
      // Generate random test results
      const newTest: NetworkMetricsData = {
        downloadSpeed: Math.random() * 50 + 70, // 70-120 Mbps
        uploadSpeed: Math.random() * 10 + 10, // 10-20 Mbps
        latency: Math.random() * 20 + 10, // 10-30ms
        jitter: Math.random() * 3 + 1, // 1-4ms
        packetLoss: Math.random() * 0.09 + 0.01, // 0.01-0.1%
        timestamp: new Date().toISOString(),
      };
      
      setNetworkData([newTest, ...networkData]);
      setIsRunningTest(false);
    }, 3000);
  };

  // Current metrics (most recent test)
  const currentMetrics = networkData.length > 0 ? networkData[0] : null;

  // Get color based on network quality
  const getQualityColor = (value: number, type: 'download' | 'upload' | 'latency' | 'packetLoss') => {
    switch (type) {
      case 'download':
        return value > 90 ? 'text-emerald-500' : value > 50 ? 'text-amber-500' : 'text-red-500';
      case 'upload':
        return value > 15 ? 'text-emerald-500' : value > 8 ? 'text-amber-500' : 'text-red-500';
      case 'latency':
        return value < 20 ? 'text-emerald-500' : value < 40 ? 'text-amber-500' : 'text-red-500';
      case 'packetLoss':
        return value < 0.02 ? 'text-emerald-500' : value < 0.05 ? 'text-amber-500' : 'text-red-500';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="space-y-8">
      {/* Current network metrics */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <Card>
          <CardHeader>
            <CardTitle>Current Network Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {currentMetrics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-secondary/30 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Download Speed</div>
                  <div className={`text-2xl font-bold ${getQualityColor(currentMetrics.downloadSpeed, 'download')}`}>
                    {formatNumber(currentMetrics.downloadSpeed)} <span className="text-base font-normal">Mbps</span>
                  </div>
                </div>
                
                <div className="bg-secondary/30 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Upload Speed</div>
                  <div className={`text-2xl font-bold ${getQualityColor(currentMetrics.uploadSpeed, 'upload')}`}>
                    {formatNumber(currentMetrics.uploadSpeed)} <span className="text-base font-normal">Mbps</span>
                  </div>
                </div>
                
                <div className="bg-secondary/30 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Latency</div>
                  <div className={`text-2xl font-bold ${getQualityColor(currentMetrics.latency, 'latency')}`}>
                    {currentMetrics.latency.toFixed(0)} <span className="text-base font-normal">ms</span>
                  </div>
                </div>
                
                <div className="bg-secondary/30 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Packet Loss</div>
                  <div className={`text-2xl font-bold ${getQualityColor(currentMetrics.packetLoss, 'packetLoss')}`}>
                    {(currentMetrics.packetLoss * 100).toFixed(2)}<span className="text-base font-normal">%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                No network tests have been run yet. Run a test to see your metrics.
              </div>
            )}
            
            <div className="mt-6 flex items-center gap-4">
              <Button
                onClick={runNetworkTest}
                disabled={isRunningTest}
                className="relative"
              >
                {isRunningTest ? 'Running Test...' : 'Run Network Test'}
                {isRunningTest && (
                  <motion.span
                    variants={pulseAnimation}
                    animate="pulse"
                    className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500"
                  />
                )}
              </Button>
              
              {isRunningTest && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground"
                >
                  Testing network speed and quality...
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Historical data */}
      <motion.div
        variants={slideUp}
        initial="hidden"
        animate="visible"
      >
        <Card>
          <CardHeader>
            <CardTitle>Historical Network Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium">Date & Time</th>
                    <th className="text-left p-3 font-medium">Download</th>
                    <th className="text-left p-3 font-medium">Upload</th>
                    <th className="text-left p-3 font-medium">Latency</th>
                    <th className="text-left p-3 font-medium">Jitter</th>
                    <th className="text-left p-3 font-medium">Packet Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {networkData.map((test, index) => (
                    <tr key={index} className="border-b border-border">
                      <td className="p-3 text-sm">{formatDate(test.timestamp)}</td>
                      <td className={`p-3 text-sm ${getQualityColor(test.downloadSpeed, 'download')}`}>
                        {formatNumber(test.downloadSpeed)} Mbps
                      </td>
                      <td className={`p-3 text-sm ${getQualityColor(test.uploadSpeed, 'upload')}`}>
                        {formatNumber(test.uploadSpeed)} Mbps
                      </td>
                      <td className={`p-3 text-sm ${getQualityColor(test.latency, 'latency')}`}>
                        {test.latency.toFixed(0)} ms
                      </td>
                      <td className="p-3 text-sm">
                        {test.jitter.toFixed(1)} ms
                      </td>
                      <td className={`p-3 text-sm ${getQualityColor(test.packetLoss, 'packetLoss')}`}>
                        {(test.packetLoss * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                  {networkData.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No network tests have been recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default NetworkMetrics;