import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { fadeIn, slideUp, staggerContainer } from '../lib/framer-variants';
import { Globe, Clock, Zap, CheckCircle, XCircle, AlertCircle, Play } from 'lucide-react';

// Import our mock data
import { 
  DEMO_MONITORING_SESSIONS, 
  MonitoringSession, 
  SegmentStatus,
  getSessionTimeRemaining,
  getOverallSessionStatus,
  simulateSegmentCompletion 
} from '../types';

// Enhanced monitoring ring with proper segmentation and glow effects
interface MonitoringRingProps {
  session: MonitoringSession;
}

const MonitoringRing: React.FC<MonitoringRingProps> = ({ session }) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Update time every second to show real-time progress
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // SVG settings for our ring with proper spacing
  const centerX = 80;
  const centerY = 80;
  const radius = 50;
  const strokeWidth = 8;
  
  // Calculate segments with very large gaps for crystal clear visual separation
  const totalSegments = 8;
  const gapAngle = 15; // 15 degrees gap between segments - very clear visual separation
  const segmentAngle = (360 - (totalSegments * gapAngle)) / totalSegments; // Remaining space divided by segments
  
  const segments = [];
  
  for (let i = 0; i < totalSegments; i++) {
    // Calculate start and end angles with gaps
    const startAngle = (i * (segmentAngle + gapAngle)) - 90; // Start from top (-90 degrees)
    const endAngle = startAngle + segmentAngle;
    
    const segment = session.segments[i];
    
    segments.push({
      id: i,
      startAngle,
      endAngle,
      status: segment.status,
      isActive: segment.status === 'active'
    });
  }
  
  // Convert angle to coordinates on the circle
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };
  
  // Create SVG arc path for segments with proper gaps
  const describeArc = (centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius, startAngle);
    const end = polarToCartesian(centerX, centerY, radius, endAngle);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    // Create a path that doesn't connect to center - just an arc
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };
  
  // Get base color for each segment status (removed amber)
  const getSegmentColor = (status: SegmentStatus) => {
    switch (status) {
      case 'pending': return '#6b7280'; // Gray for pending
      case 'active': return '#3b82f6'; // Blue for active
      case 'completed_up': return '#10b981'; // Green for successful
      case 'completed_down': return '#ef4444'; // Red for failed
      case 'completed_degraded': return '#ef4444'; // Red for degraded (was amber, now red)
      default: return '#6b7280';
    }
  };

  // Get glow color and animation settings for each status
  const getGlowSettings = (status: SegmentStatus) => {
    switch (status) {
      case 'active':
        return {
          color: '#3b82f6',
          shadowColor: '#3b82f6',
          shouldAnimate: true,
          animationType: 'blink' // Blinking animation for active monitoring
        };
      case 'completed_up':
        return {
          color: '#10b981',
          shadowColor: '#10b981',
          shouldAnimate: true,
          animationType: 'glow' // Steady glow for successful completion
        };
      case 'completed_down':
      case 'completed_degraded': // Both map to red now
        return {
          color: '#ef4444',
          shadowColor: '#ef4444',
          shouldAnimate: true,
          animationType: 'glow' // Steady glow for problems
        };
      default:
        return {
          color: '#6b7280',
          shadowColor: '#6b7280',
          shouldAnimate: false,
          animationType: 'none'
        };
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg width="160" height="160" className="transform">
        {/* Background ring outline for visual reference */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1"
          className="opacity-30"
        />
        
        {/* Render each segment with proper spacing and glow effects */}
        {segments.map((segment) => {
          const glowSettings = getGlowSettings(segment.status);
          
          return (
            <g key={segment.id}>
              {/* Glow effect layer - rendered behind the main segment */}
              {glowSettings.shouldAnimate && (
                <motion.path
                  d={describeArc(centerX, centerY, radius, segment.startAngle, segment.endAngle)}
                  fill="none"
                  stroke={glowSettings.shadowColor}
                  strokeWidth={strokeWidth + 6}
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={
                    glowSettings.animationType === 'blink'
                      ? {
                          // Blinking animation for active monitoring
                          opacity: [0.2, 0.8, 0.2, 0.8, 0.2],
                          filter: [
                            `drop-shadow(0 0 4px ${glowSettings.shadowColor})`,
                            `drop-shadow(0 0 16px ${glowSettings.shadowColor})`,
                            `drop-shadow(0 0 4px ${glowSettings.shadowColor})`,
                            `drop-shadow(0 0 16px ${glowSettings.shadowColor})`,
                            `drop-shadow(0 0 4px ${glowSettings.shadowColor})`
                          ]
                        }
                      : glowSettings.animationType === 'glow'
                      ? {
                          // Steady glow animation for completed states
                          opacity: [0.4, 0.6, 0.4],
                          filter: [
                            `drop-shadow(0 0 6px ${glowSettings.shadowColor})`,
                            `drop-shadow(0 0 10px ${glowSettings.shadowColor})`,
                            `drop-shadow(0 0 6px ${glowSettings.shadowColor})`
                          ]
                        }
                      : { opacity: 0 }
                  }
                  transition={
                    glowSettings.animationType === 'blink'
                      ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
                      : glowSettings.animationType === 'glow'
                      ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0 }
                  }
                />
              )}
              
              {/* Main segment path */}
              <path
                d={describeArc(centerX, centerY, radius, segment.startAngle, segment.endAngle)}
                fill="none"
                stroke={getSegmentColor(segment.status)}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className="transition-all duration-300"
                style={{
                  filter: glowSettings.shouldAnimate && glowSettings.animationType === 'glow'
                    ? `drop-shadow(0 0 3px ${glowSettings.shadowColor})` 
                    : 'none'
                }}
              />
            </g>
          );
        })}
        
        {/* Center status indicator with improved styling */}
        <circle
          cx={centerX}
          cy={centerY}
          r="28"
          fill="rgba(0, 0, 0, 0.3)"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="2"
        />
        
        {/* Center icon based on overall status */}
        <foreignObject x="62" y="62" width="36" height="36">
          <div className="flex items-center justify-center w-full h-full">
            {session.isActive && session.currentSegment >= 0 && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-7 h-7 text-blue-400" />
              </motion.div>
            )}
            {!session.isActive && getOverallSessionStatus(session) === 'up' && (
              <CheckCircle className="w-7 h-7 text-green-400" />
            )}
            {!session.isActive && getOverallSessionStatus(session) === 'down' && (
              <XCircle className="w-7 h-7 text-red-400" />
            )}
            {!session.isActive && (getOverallSessionStatus(session) === 'mixed' || getOverallSessionStatus(session) === 'degraded') && (
              <XCircle className="w-7 h-7 text-red-400" />
            )}
          </div>
        </foreignObject>
      </svg>
      
      {/* Progress text overlay positioned below the ring */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-xs text-muted-foreground">
          {session.isActive ? (
            `${Math.ceil(getSessionTimeRemaining(session))} min left`
          ) : (
            'Completed'
          )}
        </div>
      </div>
    </div>
  );
};

// Main monitoring dashboard component properly wrapped in layout
const WebsiteMonitorPage: React.FC = () => {
  // State for managing monitoring sessions
  const [monitoringSessions, setMonitoringSessions] = useState<MonitoringSession[]>(DEMO_MONITORING_SESSIONS);
  
  // State for new monitoring form
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Simulate real-time updates (in production, this would come from WebSocket)
  useEffect(() => {
    const interval = setInterval(() => {
      setMonitoringSessions(sessions => 
        sessions.map(session => {
          // Simulate segment completion every 10 seconds for demo (would be 10 minutes in production)
          if (session.isActive && Math.random() < 0.08) { // 8% chance each second for demo purposes
            return simulateSegmentCompletion(session);
          }
          return session;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const handleStartMonitoring = async () => {
    setError('');
    
    if (!websiteUrl.trim()) {
      setError('Please enter a website URL');
      return;
    }
    
    if (!validateUrl(websiteUrl)) {
      setError('Please enter a valid URL (must start with http:// or https://)');
      return;
    }

    setLoading(true);
    
    // Simulate API call to start monitoring
    setTimeout(() => {
      const newSession: MonitoringSession = {
        id: `session_${Date.now()}`,
        websiteUrl: websiteUrl,
        startedAt: new Date().toISOString(),
        currentSegment: 0,
        totalSegments: 8,
        segmentDurationMinutes: 10,
        totalPaid: 2.40, // 80 minutes at $0.03/min
        isActive: true,
        segments: [
          {
            id: 0,
            status: 'active',
            startTime: new Date().toISOString(),
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
      };
      
      setMonitoringSessions([newSession, ...monitoringSessions]);
      setWebsiteUrl('');
      setLoading(false);
    }, 2000);
  };

  const getStatusText = (session: MonitoringSession): string => {
    if (!session.isActive) {
      const overallStatus = getOverallSessionStatus(session);
      switch (overallStatus) {
        case 'up': return 'Monitoring Complete - All Good';
        case 'down': return 'Monitoring Complete - Issues Detected';
        case 'mixed': return 'Monitoring Complete - Mixed Results';
        default: return 'Monitoring Complete';
      }
    }
    
    if (session.currentSegment === 0) {
      return 'Starting First Check...';
    }
    
    return `Monitoring Segment ${session.currentSegment + 1}/8`;
  };

  const getStatusIcon = (session: MonitoringSession) => {
    if (!session.isActive) {
      const overallStatus = getOverallSessionStatus(session);
      switch (overallStatus) {
        case 'up': return <CheckCircle className="w-4 h-4 text-green-500" />;
        case 'down': return <XCircle className="w-4 h-4 text-red-500" />;
        case 'mixed': return <AlertCircle className="w-4 h-4 text-amber-500" />;
        default: return <Clock className="w-4 h-4 text-gray-500" />;
      }
    }
    
    return <Zap className="w-4 h-4 text-blue-500" />;
  };

  return (
    <Layout title="Website Monitoring">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header section with improved typography */}
        <motion.div variants={fadeIn} className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold">Website Monitoring</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Monitor your websites with our 8-segment monitoring system. 
            Each segment monitors your site for 10 minutes with real-time visual feedback.
          </p>
        </motion.div>

        {/* New Monitoring Setup Card */}
        <motion.div variants={slideUp}>
          <Card className="border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-blue-500" />
                Start New Monitoring Session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* URL Input Section */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="website-url" className="text-sm font-medium">
                      Website URL
                    </label>
                    <Input
                      id="website-url"
                      type="url"
                      placeholder="https://example.com"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="text-lg"
                    />
                  </div>

                  {error && (
                    <div className="p-3 text-sm bg-destructive/20 text-destructive rounded-md">
                      {error}
                    </div>
                  )}

                  <Button 
                    onClick={handleStartMonitoring}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Starting monitoring...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Start 80-Minute Monitoring ($2.40)
                      </div>
                    )}
                  </Button>
                </div>

                {/* Enhanced Monitoring Info Section */}
                <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold">Visual Monitoring Guide:</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                      <span>Gray = Waiting to start</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                      <span>Blue glow = Currently monitoring</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Green glow = Website healthy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Red glow = Website problems</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-secondary text-xs text-muted-foreground">
                    Each segment = 10 minutes of monitoring
                    <br />
                    Total duration = 80 minutes (8 segments)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Monitoring Sessions Grid */}
        <motion.div variants={slideUp}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Monitoring Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monitoringSessions.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {monitoringSessions.map((session, index) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-secondary/30 rounded-lg p-4 space-y-4"
                      >
                        {/* Website Status Header */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(session)}
                            <span className="font-semibold text-sm">
                              {getStatusText(session)}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono break-all">
                            {session.websiteUrl}
                          </div>
                        </div>

                        {/* Enhanced Monitoring Ring with proper spacing */}
                        <div className="flex justify-center py-4">
                          <MonitoringRing session={session} />
                        </div>

                        {/* Session Details */}
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Duration:</span>
                            <span>80 minutes (8 × 10min)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Cost:</span>
                            <span>${session.totalPaid.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Started:</span>
                            <span>{new Date(session.startedAt).toLocaleTimeString()}</span>
                          </div>
                          {session.isActive && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Time Remaining:</span>
                              <span className="font-medium">
                                {Math.ceil(getSessionTimeRemaining(session))} minutes
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Monitoring Sessions</h3>
                  <p className="text-sm">Start monitoring your first website using the form above.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default WebsiteMonitorPage;