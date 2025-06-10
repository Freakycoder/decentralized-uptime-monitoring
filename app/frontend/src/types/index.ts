/**
 * Represents a method through which users can contribute data
 * Each method has its own specific implementation and reward structure
 */
export interface ContributionMethod {
    id: string;              // Unique identifier for the method
    name: string;            // Display name
    description: string;     // Detailed description
    icon: string;            // Icon identifier
    rewardRate: number;      // SOL tokens per contribution
    active: boolean;         // Whether this method is currently active
    metrics: {
        contributions: number; // Total number of contributions
        rewards: number;       // Total rewards earned (in SOL)
        lastContribution: string; // ISO timestamp of last contribution
    };
}

/**
 * Aggregated user statistics across all contribution methods
 */
export interface UserStats {
    totalContributions: number;  // Total number of contributions across all methods
    totalRewards: number;        // Total rewards earned (in SOL)
    activeDevices: number;       // Number of currently active devices
    contributionStreak: number;  // Current consecutive days with contributions
}

/**
 * User profile information
 */
export interface User {
    id: string;             // Unique user identifier
    username: string;       // Username
    email: string;          // Email address
    walletAddress: string;  // Solana wallet address for receiving rewards
    joinedAt: string;       // ISO timestamp of when user joined
}

/**
 * Device registered by a user for data contributions
 */
export interface Device {
    id: string;                   // Unique device identifier
    name: string;                 // User-assigned device name
    type: 'desktop' | 'laptop' | 'mobile' | 'tablet'; // Device type
    os: string;                   // Operating system
    lastActive: string;           // ISO timestamp of last activity
    contributionMethods: string[]; // List of contribution method IDs enabled on this device
}

/**
 * Data from website monitoring contributions
 */
export interface WebsiteMonitorData {
    url: string;                // Website URL being monitored
    status: 'up' | 'down' | 'degraded'; // Current status
    responseTime: number;       // Response time in milliseconds
    lastChecked: string;        // ISO timestamp of last check
    uptimePercentage: number;   // Percentage of time website was up
}

/**
 * Data from network metrics contributions
 */
export interface NetworkMetricsData {
    downloadSpeed: number;      // Download speed in Mbps
    uploadSpeed: number;        // Upload speed in Mbps
    latency: number;            // Latency in milliseconds
    jitter: number;             // Jitter in milliseconds
    packetLoss: number;         // Packet loss as a decimal (0.01 = 1%)
    timestamp: string;          // ISO timestamp of when metrics were collected
}

/**
 * Data from geographic coverage contributions
 */
export interface GeographicDataPoint {
    latitude: number;           // Latitude coordinate
    longitude: number;          // Longitude coordinate
    connectionQuality: 'excellent' | 'good' | 'fair' | 'poor'; // Connection quality at location
    timestamp: string;          // ISO timestamp of when data was collected
}

/**
 * Historical reward data point for charting
 */
export interface HistoricalReward {
    date: string;               // Date in YYYY-MM-DD format
    rewards: number;            // Rewards earned on that date (in SOL)
}

/**
 * Leaderboard entry showing top contributors
 */
export interface LeaderboardEntry {
    username: string;           // Username
    contributions: number;      // Total number of contributions
    rewards: number;            // Total rewards earned (in SOL)
}

/**
 * User notification
 */
export interface Notification {
    id: string;                 // Unique notification identifier
    title: string;              // Notification title
    message: string;            // Notification message content
    timestamp: string;          // ISO timestamp of when notification was created
    read: boolean;              // Whether the notification has been read
}

/**
 * Data structure for compute resource contributions
 */
export interface ComputeResourceData {
    cpuUsage: number;           // CPU usage percentage
    memoryUsage: number;        // Memory usage percentage
    tasksDone: number;          // Number of compute tasks completed
    uptime: number;             // Uptime in seconds
    timestamp: string;          // ISO timestamp of when data was collected
}

/**
 * App usage metrics data
 */
export interface AppUsageData {
    appId: string;              // Application identifier
    usageDuration: number;      // Usage duration in seconds
    performanceScore: number;   // Performance score (1-100)
    crashCount: number;         // Number of crashes
    timestamp: string;          // ISO timestamp of when data was collected
}

/**
 * Reward transaction details
 */
export interface RewardTransaction {
    id: string;                 // Transaction ID
    amount: number;             // Amount of SOL
    contributionMethod: string; // ID of the contribution method
    timestamp: string;          // ISO timestamp of transaction
    status: 'pending' | 'completed' | 'failed'; // Transaction status
    txHash?: string;            // Solana transaction hash (if completed)
}

// Mock data for website monitoring system
// Each monitoring session tracks 8 segments of 10 minutes each (80 minutes total)

export type SegmentStatus = 'pending' | 'active' | 'completed_up' | 'completed_down' | 'completed_degraded';

export interface MonitoringSegment {
  id: number;
  status: SegmentStatus;
  startTime: string | null; // ISO timestamp when this segment started
  completedAt: string | null; // ISO timestamp when this segment completed
  responseTime: number | null; // Response time in milliseconds (null if failed)
  statusCode: number | null; // HTTP status code (null if failed)
}

export interface MonitoringSession {
  id: string;
  websiteUrl: string;
  startedAt: string; // ISO timestamp when monitoring began
  currentSegment: number; // Index of currently active segment (0-7)
  totalSegments: number; // Always 8 for our design
  segmentDurationMinutes: number; // Always 10 for our design
  segments: MonitoringSegment[];
  isActive: boolean;
  totalPaid: number; // Amount paid for this monitoring session
}

// Helper function to create initial segments
const createInitialSegments = (): MonitoringSegment[] => {
  return Array.from({ length: 8 }, (_, index) => ({
    id: index,
    status: 'pending',
    startTime: null,
    completedAt: null,
    responseTime: null,
    statusCode: null
  }));
};

// Demo monitoring sessions with different states of progress
export const DEMO_MONITORING_SESSIONS: MonitoringSession[] = [
  {
    id: 'session_1',
    websiteUrl: 'https://mystore.com',
    startedAt: '2025-06-10T14:00:00Z',
    currentSegment: 2, // Currently monitoring 3rd segment
    totalSegments: 8,
    segmentDurationMinutes: 10,
    totalPaid: 2.40,
    isActive: true,
    segments: [
      {
        id: 0,
        status: 'completed_up',
        startTime: '2025-06-10T14:00:00Z',
        completedAt: '2025-06-10T14:10:00Z',
        responseTime: 245,
        statusCode: 200
      },
      {
        id: 1,
        status: 'completed_up',
        startTime: '2025-06-10T14:10:00Z',
        completedAt: '2025-06-10T14:20:00Z',
        responseTime: 198,
        statusCode: 200
      },
      {
        id: 2,
        status: 'active', // Currently monitoring this segment
        startTime: '2025-06-10T14:20:00Z',
        completedAt: null,
        responseTime: null,
        statusCode: null
      },
      ...Array.from({ length: 5 }, (_, index) => ({
        id: index + 3,
        status: 'pending' as SegmentStatus,
        startTime: null,
        completedAt: null,
        responseTime: null,
        statusCode: null
      }))
    ]
  },
  {
    id: 'session_2',
    websiteUrl: 'https://blog.example.org',
    startedAt: '2025-06-10T13:30:00Z',
    currentSegment: 5, // Currently monitoring 6th segment
    totalSegments: 8,
    segmentDurationMinutes: 10,
    totalPaid: 2.40,
    isActive: true,
    segments: [
      {
        id: 0,
        status: 'completed_up',
        startTime: '2025-06-10T13:30:00Z',
        completedAt: '2025-06-10T13:40:00Z',
        responseTime: 156,
        statusCode: 200
      },
      {
        id: 1,
        status: 'completed_up',
        startTime: '2025-06-10T13:40:00Z',
        completedAt: '2025-06-10T13:50:00Z',
        responseTime: 178,
        statusCode: 200
      },
      {
        id: 2,
        status: 'completed_down',
        startTime: '2025-06-10T13:50:00Z',
        completedAt: '2025-06-10T14:00:00Z',
        responseTime: null,
        statusCode: null
      },
      {
        id: 3,
        status: 'completed_down',
        startTime: '2025-06-10T14:00:00Z',
        completedAt: '2025-06-10T14:10:00Z',
        responseTime: null,
        statusCode: null
      },
      {
        id: 4,
        status: 'completed_up',
        startTime: '2025-06-10T14:10:00Z',
        completedAt: '2025-06-10T14:20:00Z',
        responseTime: 234,
        statusCode: 200
      },
      {
        id: 5,
        status: 'active', // Currently monitoring this segment
        startTime: '2025-06-10T14:20:00Z',
        completedAt: null,
        responseTime: null,
        statusCode: null
      },
      {
        id: 6,
        status: 'pending',
        startTime: null,
        completedAt: null,
        responseTime: null,
        statusCode: null
      },
      {
        id: 7,
        status: 'pending',
        startTime: null,
        completedAt: null,
        responseTime: null,
        statusCode: null
      }
    ]
  },
  {
    id: 'session_3',
    websiteUrl: 'https://api.myapp.io',
    startedAt: '2025-06-10T14:20:00Z',
    currentSegment: 0, // Just started, monitoring first segment
    totalSegments: 8,
    segmentDurationMinutes: 10,
    totalPaid: 2.40,
    isActive: true,
    segments: [
      {
        id: 0,
        status: 'active', // Just started monitoring
        startTime: '2025-06-10T14:20:00Z',
        completedAt: null,
        responseTime: null,
        statusCode: null
      },
      ...Array.from({ length: 7 }, (_, index) => ({
        id: index + 1,
        status: 'pending' as SegmentStatus,
        startTime: null,
        completedAt: null,
        responseTime: null,
        statusCode: null
      }))
    ]
  },
  {
    id: 'session_4',
    websiteUrl: 'https://shop.example.net',
    startedAt: '2025-06-10T13:00:00Z',
    currentSegment: -1, // Completed all segments
    totalSegments: 8,
    segmentDurationMinutes: 10,
    totalPaid: 2.40,
    isActive: false,
    segments: [
      {
        id: 0,
        status: 'completed_up',
        startTime: '2025-06-10T13:00:00Z',
        completedAt: '2025-06-10T13:10:00Z',
        responseTime: 189,
        statusCode: 200
      },
      {
        id: 1,
        status: 'completed_up',
        startTime: '2025-06-10T13:10:00Z',
        completedAt: '2025-06-10T13:20:00Z',
        responseTime: 167,
        statusCode: 200
      },
      {
        id: 2,
        status: 'completed_degraded',
        startTime: '2025-06-10T13:20:00Z',
        completedAt: '2025-06-10T13:30:00Z',
        responseTime: 1245,
        statusCode: 200
      },
      {
        id: 3,
        status: 'completed_up',
        startTime: '2025-06-10T13:30:00Z',
        completedAt: '2025-06-10T13:40:00Z',
        responseTime: 203,
        statusCode: 200
      },
      {
        id: 4,
        status: 'completed_up',
        startTime: '2025-06-10T13:40:00Z',
        completedAt: '2025-06-10T13:50:00Z',
        responseTime: 178,
        statusCode: 200
      },
      {
        id: 5,
        status: 'completed_up',
        startTime: '2025-06-10T13:50:00Z',
        completedAt: '2025-06-10T14:00:00Z',
        responseTime: 156,
        statusCode: 200
      },
      {
        id: 6,
        status: 'completed_up',
        startTime: '2025-06-10T14:00:00Z',
        completedAt: '2025-06-10T14:10:00Z',
        responseTime: 234,
        statusCode: 200
      },
      {
        id: 7,
        status: 'completed_up',
        startTime: '2025-06-10T14:10:00Z',
        completedAt: '2025-06-10T14:20:00Z',
        responseTime: 198,
        statusCode: 200
      }
    ]
  }
];

// Utility functions for working with monitoring data

export const getSegmentProgress = (session: MonitoringSession): number => {
  // Returns progress as a percentage (0-100)
  const completedSegments = session.segments.filter(
    segment => segment.status.startsWith('completed_')
  ).length;
  
  // Add partial progress for current active segment
  const activeSegment = session.segments.find(segment => segment.status === 'active');
  let activeProgress = 0;
  
  if (activeSegment && activeSegment.startTime) {
    const now = new Date().getTime();
    const segmentStart = new Date(activeSegment.startTime).getTime();
    const segmentDuration = session.segmentDurationMinutes * 60 * 1000; // Convert to milliseconds
    const elapsed = now - segmentStart;
    activeProgress = Math.min(elapsed / segmentDuration, 1);
  }
  
  return ((completedSegments + activeProgress) / session.totalSegments) * 100;
};

export const getSessionTimeRemaining = (session: MonitoringSession): number => {
  // Returns time remaining in minutes
  if (!session.isActive) return 0;
  
  const completedSegments = session.segments.filter(
    segment => segment.status.startsWith('completed_')
  ).length;
  
  const remainingSegments = session.totalSegments - completedSegments;
  
  // Subtract elapsed time from current active segment
  const activeSegment = session.segments.find(segment => segment.status === 'active');
  let activeElapsed = 0;
  
  if (activeSegment && activeSegment.startTime) {
    const now = new Date().getTime();
    const segmentStart = new Date(activeSegment.startTime).getTime();
    activeElapsed = (now - segmentStart) / (1000 * 60); // Convert to minutes
  }
  
  return (remainingSegments * session.segmentDurationMinutes) - activeElapsed;
};

export const getOverallSessionStatus = (session: MonitoringSession): 'up' | 'down' | 'degraded' | 'mixed' => {
  const completedSegments = session.segments.filter(
    segment => segment.status.startsWith('completed_')
  );
  
  if (completedSegments.length === 0) return 'up'; // No data yet
  
  const upCount = completedSegments.filter(s => s.status === 'completed_up').length;
  const downCount = completedSegments.filter(s => s.status === 'completed_down').length;
  const degradedCount = completedSegments.filter(s => s.status === 'completed_degraded').length;
  
  // If all segments are the same status
  if (upCount === completedSegments.length) return 'up';
  if (downCount === completedSegments.length) return 'down';
  if (degradedCount === completedSegments.length) return 'degraded';
  
  // Mixed results
  return 'mixed';
};

// Simulated real-time update function (for demo purposes)
export const simulateSegmentCompletion = (
  session: MonitoringSession
): MonitoringSession => {
  if (!session.isActive || session.currentSegment >= session.totalSegments) {
    return session;
  }
  
  const updatedSegments = [...session.segments];
  const currentSegment = updatedSegments[session.currentSegment];
  
  if (currentSegment.status === 'active') {
    // Simulate completion with random result
    const outcomes: Array<{ status: SegmentStatus; responseTime: number | null; statusCode: number | null }> = [
      { status: 'completed_up', responseTime: Math.floor(Math.random() * 300) + 100, statusCode: 200 },
      { status: 'completed_up', responseTime: Math.floor(Math.random() * 300) + 100, statusCode: 200 },
      { status: 'completed_up', responseTime: Math.floor(Math.random() * 300) + 100, statusCode: 200 },
      { status: 'completed_up', responseTime: Math.floor(Math.random() * 300) + 100, statusCode: 200 },
      { status: 'completed_degraded', responseTime: Math.floor(Math.random() * 2000) + 1000, statusCode: 200 },
      { status: 'completed_down', responseTime: null, statusCode: null }
    ];
    
    const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    
    updatedSegments[session.currentSegment] = {
      ...currentSegment,
      status: randomOutcome.status,
      completedAt: new Date().toISOString(),
      responseTime: randomOutcome.responseTime,
      statusCode: randomOutcome.statusCode
    };
    
    // Start next segment if available
    const nextSegmentIndex = session.currentSegment + 1;
    if (nextSegmentIndex < session.totalSegments) {
      updatedSegments[nextSegmentIndex] = {
        ...updatedSegments[nextSegmentIndex],
        status: 'active',
        startTime: new Date().toISOString()
      };
    }
    
    return {
      ...session,
      segments: updatedSegments,
      currentSegment: nextSegmentIndex >= session.totalSegments ? -1 : nextSegmentIndex,
      isActive: nextSegmentIndex < session.totalSegments
    };
  }
  
  return session;
};