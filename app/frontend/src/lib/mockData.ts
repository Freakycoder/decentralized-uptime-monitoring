import { 
    ContributionMethod, 
    UserStats, 
    User, 
    Device, 
    WebsiteMonitorData, 
    NetworkMetricsData, 
    GeographicDataPoint 
  } from '../types';
  
  /**
   * Mock data for contribution methods available in the system
   * Each method represents a different way users can contribute data
   */
  export const contributionMethods: ContributionMethod[] = [
    {
      id: 'website-monitor',
      name: 'Website Monitoring',
      description: 'Monitor website performance, uptime, and response times across the internet',
      icon: 'globe',
      rewardRate: 0.05,  // SOL per contribution
      active: true,
      metrics: {
        contributions: 157,
        rewards: 7.85,
        lastContribution: '2025-04-19T14:32:11Z',
      },
    },
    {
      id: 'network-metrics',
      name: 'Network Metrics',
      description: 'Measure network quality, speed, and coverage to create better connectivity maps',
      icon: 'wifi',
      rewardRate: 0.08,
      active: true,
      metrics: {
        contributions: 412,
        rewards: 32.96,
        lastContribution: '2025-04-20T09:15:47Z',
      },
    },
    {
      id: 'compute-resources',
      name: 'Computing Resources',
      description: 'Contribute CPU/GPU cycles for distributed computing tasks and scientific research',
      icon: 'cpu',
      rewardRate: 0.12,
      active: false,
      metrics: {
        contributions: 0,
        rewards: 0,
        lastContribution: '',
      },
    },
    {
      id: 'geographic-data',
      name: 'Geographic Data',
      description: 'Provide anonymous location data for coverage mapping and infrastructure planning',
      icon: 'map-pin',
      rewardRate: 0.04,
      active: true,
      metrics: {
        contributions: 289,
        rewards: 11.56,
        lastContribution: '2025-04-19T22:07:33Z',
      },
    },
    {
      id: 'app-usage',
      name: 'App Usage Metrics',
      description: 'Share anonymous app usage patterns for performance insights and improvements',
      icon: 'bar-chart-2',
      rewardRate: 0.06,
      active: false,
      metrics: {
        contributions: 0,
        rewards: 0,
        lastContribution: '',
      },
    },
  ];
  
  /**
   * Mock user statistics for the current logged-in user
   * Aggregates all contributions across different methods
   */
  export const userStats: UserStats = {
    totalContributions: 858,
    totalRewards: 52.37,
    activeDevices: 2,
    contributionStreak: 14,
  };
  
  /**
   * Mock user profile data
   */
  export const currentUser: User = {
    id: 'usr_12345',
    username: 'johndoe',
    email: 'john.doe@example.com',
    walletAddress: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
    joinedAt: '2024-12-15T10:30:00Z',
  };
  
  /**
   * Mock list of user's registered devices
   */
  export const userDevices: Device[] = [
    {
      id: 'dev_1',
      name: 'MacBook Pro',
      type: 'laptop',
      os: 'macOS 15.4',
      lastActive: '2025-04-20T08:45:22Z',
      contributionMethods: ['website-monitor', 'network-metrics'],
    },
    {
      id: 'dev_2',
      name: 'iPhone 17',
      type: 'mobile',
      os: 'iOS 19.2',
      lastActive: '2025-04-19T19:12:05Z',
      contributionMethods: ['geographic-data', 'network-metrics'],
    },
  ];
  
  /**
   * Mock data for website monitor results
   */
  export const websiteMonitorData: WebsiteMonitorData[] = [
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
  
  /**
   * Mock network metrics data
   */
  export const networkMetricsData: NetworkMetricsData[] = [
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
  
  /**
   * Mock geographic data points
   */
  export const geographicData: GeographicDataPoint[] = [
    {
      latitude: 37.7749,
      longitude: -122.4194,
      connectionQuality: 'excellent',
      timestamp: '2025-04-20T09:45:12Z',
    },
    {
      latitude: 37.7833,
      longitude: -122.4167,
      connectionQuality: 'good',
      timestamp: '2025-04-20T09:50:23Z',
    },
    {
      latitude: 37.7691,
      longitude: -122.4449,
      connectionQuality: 'fair',
      timestamp: '2025-04-20T10:05:47Z',
    },
    {
      latitude: 37.7857,
      longitude: -122.4011,
      connectionQuality: 'poor',
      timestamp: '2025-04-20T10:12:32Z',
    },
  ];
  
  /**
   * Mock historical rewards data for charts
   * Shows rewards earned over time (last 7 days)
   */
  export const historicalRewards = [
    { date: '2025-04-14', rewards: 3.42 },
    { date: '2025-04-15', rewards: 5.18 },
    { date: '2025-04-16', rewards: 4.76 },
    { date: '2025-04-17', rewards: 7.21 },
    { date: '2025-04-18', rewards: 6.54 },
    { date: '2025-04-19', rewards: 8.12 },
    { date: '2025-04-20', rewards: 4.92 },
  ];
  
  /**
   * Mock leaderboard data showing top contributors
   */
  export const leaderboardData = [
    { username: 'datawizard', contributions: 1845, rewards: 124.56 },
    { username: 'networkguru', contributions: 1723, rewards: 115.89 },
    { username: 'pixelmonitor', contributions: 1654, rewards: 102.37 },
    { username: 'johndoe', contributions: 858, rewards: 52.37 },
    { username: 'datacontributor', contributions: 745, rewards: 48.92 },
    { username: 'pingguru', contributions: 712, rewards: 45.16 },
    { username: 'webspeedster', contributions: 684, rewards: 41.04 },
    { username: 'netexplorer', contributions: 621, rewards: 37.26 },
    { username: 'solanauser', contributions: 587, rewards: 34.12 },
    { username: 'depinguru', contributions: 512, rewards: 30.74 },
  ];
  
  /**
   * Mock notification data
   */
  export const notifications = [
    {
      id: 'notif_1',
      title: 'New Reward',
      message: 'You earned 0.08 SOL for your network measurements',
      timestamp: '2025-04-20T09:15:47Z',
      read: false,
    },
    {
      id: 'notif_2',
      title: 'Contribution Streak',
      message: `Congratulations! You've maintained a 14-day contribution streak`,
      timestamp: '2025-04-19T23:00:12Z',
      read: true,
    },
    {
      id: 'notif_3',
      title: 'New Contribution Method',
      message: 'Computing Resources contribution method is coming soon',
      timestamp: '2025-04-18T14:22:36Z',
      read: true,
    },
    {
      id: 'notif_4',
      title: 'Website Down Alert',
      message: 'blog.example.net is currently experiencing downtime',
      timestamp: '2025-04-18T08:45:19Z',
      read: true,
    },
  ];