import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { WebsiteMonitorData } from '../../types';
import { fadeIn, slideUp, staggerContainer } from '../../lib/framer-variants';
import { getStatusColor, formatDate } from '../../lib/utils';


// Mock data for website monitoring
const mockWebsiteData: WebsiteMonitorData[] = [
  {
    url: 'https://example.com',
    status: 'up',
    responseTime: 245,
    lastChecked: '2025-04-20T10:15:23Z',
    uptimePercentage: 99.98,
  },
  {
    url: 'https://api.example.org',
    status: 'up',
    responseTime: 122,
    lastChecked: '2025-04-20T10:17:45Z',
    uptimePercentage: 99.95,
  },
  {
    url: 'https://dashboard.example.io',
    status: 'degraded',
    responseTime: 1250,
    lastChecked: '2025-04-20T10:14:12Z',
    uptimePercentage: 98.72,
  },
  {
    url: 'https://blog.example.net',
    status: 'down',
    responseTime: 0,
    lastChecked: '2025-04-20T10:10:05Z',
    uptimePercentage: 95.33,
  },
];

const WebsiteMonitor: React.FC = () => {
  const [websites, setWebsites] = useState<WebsiteMonitorData[]>(mockWebsiteData);
  const [newWebsiteUrl, setNewWebsiteUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newWebsiteUrl.trim()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // For now, we'll just add it to the state
      const newWebsite: WebsiteMonitorData = {
        url: newWebsiteUrl,
        status: 'up',
        responseTime: Math.floor(Math.random() * 500) + 100,
        lastChecked: new Date().toISOString(),
        uptimePercentage: 100,
      };
      
      setWebsites([newWebsite, ...websites]);
      setNewWebsiteUrl('');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Add new website form */}
      <motion.div variants={fadeIn} className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Add Website to Monitor</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="website-url" className="text-sm font-medium">
                  Website URL
                </label>
                <input
                  id="website-url"
                  type="url"
                  placeholder="https://example.com"
                  value={newWebsiteUrl}
                  onChange={(e) => setNewWebsiteUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Website'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Websites table */}
      <motion.div variants={slideUp}>
        <Card>
          <CardHeader>
            <CardTitle>Monitored Websites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">URL</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Response Time</th>
                    <th className="text-left py-3 px-4 font-medium">Uptime</th>
                    <th className="text-left py-3 px-4 font-medium">Last Checked</th>
                  </tr>
                </thead>
                <tbody>
                  {websites.map((website, index) => (
                    <tr key={index} className="border-b border-border">
                      <td className="py-3 px-4 text-sm">{website.url}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(website.status)}`}>
                          {website.status === 'up' ? 'Up' : website.status === 'degraded' ? 'Degraded' : 'Down'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {website.status === 'down' ? 'N/A' : `${website.responseTime} ms`}
                      </td>
                      <td className="py-3 px-4 text-sm">{website.uptimePercentage.toFixed(2)}%</td>
                      <td className="py-3 px-4 text-sm">{formatDate(website.lastChecked)}</td>
                    </tr>
                  ))}
                  {websites.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No websites currently being monitored. Add one above!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default WebsiteMonitor;