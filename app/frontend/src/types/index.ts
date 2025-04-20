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