import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { WebsiteMonitorData } from '../../types';
import { fadeIn, slideUp, staggerContainer } from '../../lib/framer-variants';
import { formatDate } from '../../lib/utils';
import axios from 'axios';
import { useNotifications } from '../../contexts/NotificationsContext';

// Extended mock data with status history
const mockWebsiteData: (WebsiteMonitorData & { statusHistory: ('up' | 'down' | 'degraded')[] })[] = [
  {
    url: 'https://example.com',
    status: 'up',
    responseTime: 245,
    lastChecked: '2025-04-20T10:15:23Z',
    uptimePercentage: 99.98,
    statusHistory: ['up', 'up', 'up', 'up', 'up', 'up', 'up', 'up']
  },
  {
    url: 'https://api.example.org',
    status: 'up',
    responseTime: 122,
    lastChecked: '2025-04-20T10:17:45Z',
    uptimePercentage: 99.95,
    statusHistory: ['up', 'up', 'up', 'up', 'up', 'up', 'up', 'up']
  },
  {
    url: 'https://dashboard.example.io',
    status: 'degraded',
    responseTime: 1250,
    lastChecked: '2025-04-20T10:14:12Z',
    uptimePercentage: 98.72,
    statusHistory: ['up', 'degraded', 'up', 'degraded', 'up', 'up', 'degraded', 'degraded']
  },
  {
    url: 'https://blog.example.net',
    status: 'down',
    responseTime: 0,
    lastChecked: '2025-04-20T10:10:05Z',
    uptimePercentage: 95.33,
    statusHistory: ['down', 'down', 'up', 'up', 'down', 'down', 'up', 'down']
  },
];

const WebsiteMonitor: React.FC = () => {
  const [websites, setWebsites] = useState<(WebsiteMonitorData & { statusHistory: ('up' | 'down' | 'degraded')[] })[]>(mockWebsiteData);
  const [newWebsiteUrl, setNewWebsiteUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotifications();

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newWebsiteUrl.trim()) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Generate random status history
      const statusOptions: ('up' | 'down' | 'degraded')[] = ['up', 'up', 'up', 'up', 'down', 'degraded'];
      const randomHistory = Array(8).fill(null).map(() =>
        statusOptions[Math.floor(Math.random() * statusOptions.length)]
      );

      // For now, we'll just add it to the state
      const newWebsite = {
        url: newWebsiteUrl,
        status: 'up' as const,
        responseTime: Math.floor(Math.random() * 500) + 100,
        lastChecked: new Date().toISOString(),
        uptimePercentage: 100,
        statusHistory: randomHistory
      };

      setWebsites([newWebsite, ...websites]);
      setNewWebsiteUrl('');
      setIsLoading(false);
    }, 1500);
  };

  // Get color for status
  const getStatusColor = (status: 'up' | 'down' | 'degraded') => {
    switch (status) {
      case 'up':
        return 'bg-emerald-500';
      case 'down':
        return 'bg-red-500';
      case 'degraded':
        return 'bg-amber-500';
      default:
        return 'bg-zinc-500';
    }
  };

  // Get status badge
  const getStatusBadge = (status: 'up' | 'down' | 'degraded') => {
    const baseClasses = "inline-flex px-2 py-1 text-xs rounded-full font-medium";

    switch (status) {
      case 'up':
        return `${baseClasses} bg-emerald-500/20 text-emerald-400 border border-emerald-500/30`;
      case 'down':
        return `${baseClasses} bg-red-500/20 text-red-400 border border-red-500/30`;
      case 'degraded':
        return `${baseClasses} bg-amber-500/20 text-amber-400 border border-amber-500/30`;
      default:
        return `${baseClasses} bg-zinc-500/20 text-zinc-400 border border-zinc-500/30`;
    }
  };

  // Handler for adding a website to monitor
  const addWebsiteHandler = async () => {
    setIsLoading(true);
    
    try {
      const response = await axios.post('http://127.0.0.1:3001/website-monitor/add', {
        url_to_monitor: newWebsiteUrl
      });
      
      console.log(response.data);
      
      // Check if the website was added successfully
      if (response.data.status_code === 200) {
        // Add a notification
        addNotification(
          'Website Added Successfully', 
          `${newWebsiteUrl} has been added to your monitoring list.`
        );
        
        // Generate random status history for the UI
        const statusOptions: ('up' | 'down' | 'degraded')[] = ['up', 'up', 'up', 'up', 'down', 'degraded'];
        const randomHistory = Array(8).fill(null).map(() =>
          statusOptions[Math.floor(Math.random() * statusOptions.length)]
        );
        
        // Add the website to the UI list
        const newWebsite = {
          url: newWebsiteUrl,
          status: 'up' as const,
          responseTime: Math.floor(Math.random() * 500) + 100,
          lastChecked: new Date().toISOString(),
          uptimePercentage: 100,
          statusHistory: randomHistory
        };
        
        setWebsites([newWebsite, ...websites]);
        setNewWebsiteUrl('');
      } else if (response.data.status_code === 409) {
        // Website already exists
        addNotification(
          'Website Already Exists', 
          `${newWebsiteUrl} is already being monitored.`
        );
      } else {
        // Some other error
        addNotification(
          'Error Adding Website', 
          `Failed to add ${newWebsiteUrl}. Please try again.`
        );
      }
    } catch (error) {
      console.error('Error adding website:', error);
      addNotification(
        'Error Adding Website', 
        `Failed to add ${newWebsiteUrl}. Server error occurred.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Add new website form */}
      <motion.div variants={fadeIn}>
        <Card className="border-purple-500/20 bg-zinc-900">
          <CardHeader className="border-b border-zinc-800">
            <CardTitle className="text-purple-300">Add Website to Monitor</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="website-url" className="text-sm font-medium text-purple-200">
                  Website URL
                </label>
                <Input
                  id="website-url"
                  type="url"
                  placeholder="https://example.com"
                  value={newWebsiteUrl}
                  onChange={(e) => setNewWebsiteUrl(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 focus:border-purple-500 text-zinc-100"
                  required
                />
              </div>
              <Button
                type="button"
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={addWebsiteHandler}
              >
                {isLoading ? 'Adding...' : 'Add Website'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Websites monitoring */}
      <motion.div variants={slideUp}>
        <Card className="border-purple-500/20 bg-zinc-900">
          <CardHeader className="border-b border-zinc-800">
            <CardTitle className="text-purple-300">Monitored Websites</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {websites.map((website, index) => (
                <div key={index} className="border border-zinc-800 rounded-lg overflow-hidden">
                  <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-800/50">
                    <div>
                      <div className="text-lg font-medium text-zinc-100 mb-1">{website.url}</div>
                      <div className="flex items-center gap-2">
                        <span className={getStatusBadge(website.status)}>
                          {website.status === 'up' ? 'Up' : website.status === 'degraded' ? 'Degraded' : 'Down'}
                        </span>
                        <span className="text-sm text-zinc-400">
                          Last checked: {formatDate(website.lastChecked)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm text-zinc-400">Response Time</div>
                        <div className="text-lg font-medium text-zinc-100">
                          {website.status === 'down' ? 'N/A' : `${website.responseTime} ms`}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-zinc-400">Uptime</div>
                        <div className="text-lg font-medium text-zinc-100">
                          {website.uptimePercentage.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="p-4 bg-zinc-900">
                    <div className="mb-2">
                      <span className="text-sm text-zinc-400">Status Timeline</span>
                      <span className="text-xs text-zinc-500 ml-2">(Each segment represents 30 min)</span>
                    </div>
                    <div className="flex h-8 w-full rounded-md overflow-hidden">
                      {website.statusHistory.map((status, i) => (
                        <div
                          key={i}
                          className={`${getStatusColor(status)} flex-1 border-r border-zinc-800 last:border-r-0`}
                          title={`${status.charAt(0).toUpperCase() + status.slice(1)} at ${new Date(Date.now() - (7 - i) * 30 * 60 * 1000).toLocaleTimeString()}`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-zinc-500">
                      <span>4 hours ago</span>
                      <span>Now</span>
                    </div>
                  </div>
                </div>
              ))}

              {websites.length === 0 && (
                <div className="py-10 text-center text-zinc-400 bg-zinc-800/30 rounded-lg border border-zinc-800">
                  No websites currently being monitored. Add one above!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default WebsiteMonitor;