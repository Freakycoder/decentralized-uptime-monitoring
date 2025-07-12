import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useAuth } from '../../contexts/AuthContext';
import { fadeIn, slideUp } from '../../lib/framer-variants';
import axios from 'axios';
import { useNotifications } from '../../contexts/NotificationsContext';
import {
  initSocket,
  setMessageHandler
} from 'shared';
import api from '@/lib/axios';

interface WebSocketConnectionStatus {
  connected: boolean;
  connecting: boolean;
  error: string | null;
}

interface ValidatorRegistrationProps {
  onComplete?: () => void;
}

const ValidatorRegistration = ({ onComplete }: ValidatorRegistrationProps = {}) => {
  const router = useRouter();
  const { connected, publicKey, signMessage } = useWallet();
  const { setVisible } = useWalletModal();
  const { setValidated } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState<string>('');
  const [step, setStep] = useState<'connect' | 'validate' | 'socket-connecting' | 'complete'>('connect');
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [socketStatus, setSocketStatus] = useState<WebSocketConnectionStatus>({
    connected: false,
    connecting: false,
    error: null
  });
  const websocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const handleWebsocketMessage = (message: any) => {
      console.log('📨 Processing WebSocket message in ValidatorRegistration:', message);
      if (message.url && message.id) {
        console.log('🌐 Received website monitoring task:', { url: message.url, id: message.id });
        addNotification(
          'New Monitoring Task',
          `New website to monitor: ${message.url}`,
          'monitoring',
          { url: message.url, website_id: message.id }
        );
      }
    }
    setMessageHandler(handleWebsocketMessage);
  }, [addNotification])

  // Check if wallet is connected when component mounts or when connection status changes
  useEffect(() => {
    console.log('🔗 Wallet connection status:', { connected, publicKey: publicKey?.toString() });
    if (connected && publicKey) {
      setStep('validate');
    }
  }, [connected, publicKey]);

  const handleConnectWallet = async () => {
    if (!connected) {
      console.log('💼 Opening wallet modal');
      setVisible(true);
    } else {
      setStep('validate');
    }
  };

  const getCurrentPosition = async (retryCount = 0): Promise<GeolocationPosition> => {
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds between retries

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('GEOLOCATION_NOT_SUPPORTED'));
        return;
      }

      // Progressive timeout - start with shorter timeout and increase for retries
      const timeout = 8000 + (retryCount * 5000); // 8s, 13s, 18s
      
      const options: PositionOptions = {
        enableHighAccuracy: retryCount === 0, // Use high accuracy on first try, fallback to network-based
        timeout: timeout,
        maximumAge: retryCount > 0 ? 300000 : 60000 // Allow older cache on retries (5 minutes vs 1 minute)
      };

      console.log(`📍 Attempting to get location (attempt ${retryCount + 1}/${maxRetries + 1}) with timeout: ${timeout}ms`);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('✅ Location obtained successfully:', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp).toISOString()
          });
          resolve(position);
        },
        async (error) => {
          let errorMessage = '';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'PERMISSION_DENIED';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'POSITION_UNAVAILABLE';
              break;
            case error.TIMEOUT:
              errorMessage = 'TIMEOUT';
              break;
            default:
              errorMessage = 'UNKNOWN_ERROR';
              break;
          }
          
          console.warn(`⚠️ Location attempt ${retryCount + 1} failed:`, errorMessage);

          // Don't retry for permission denied - user needs to manually allow
          if (error.code === error.PERMISSION_DENIED) {
            reject(new Error(errorMessage));
            return;
          }

          // Retry for timeout and position unavailable errors
          if (retryCount < maxRetries && (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE)) {
            console.log(`🔄 Retrying location request in ${retryDelay}ms...`);
            setTimeout(async () => {
              try {
                const position = await getCurrentPosition(retryCount + 1);
                resolve(position);
              } catch (retryError) {
                reject(retryError);
              }
            }, retryDelay);
          } else {
            reject(new Error(errorMessage));
          }
        },
        options
      );
    });
  };

  const establishWebsocketConnection = async (
    validatorId: string,
    latitude: number,
    longitude: number
  ) => {
    console.log('🔌 Starting WebSocket connection process...');
    setStep('socket-connecting');
    setSocketStatus({
      connected: false,
      connecting: true,
      error: null
    });

    try {

      const wsUrl = "ws://localhost:3001/ws/upgrade";

      const socket = await initSocket({
        wsUrl,
        setSocketStatus,
        validatorData: { validatorId, latitude, longitude }
      })
      websocketRef.current = socket;

      console.log('✅ Socket initialized and registration handled automatically!');

      addNotification(
        'Network Connection Established',
        'Successfully connected to the validator network.',
        'success'
      );

      setTimeout(() => {
        setStep('complete');
      }, 3000);

    } catch (error) {
      console.error('❌ Error establishing WebSocket connection:', error);
      setSocketStatus({
        connected: false,
        connecting: false,
        error: 'Failed to establish connection'
      });
    }
  };

  const handleValidatorRegistrationWithManualLocation = async (manualLat: number, manualLng: number) => {
    await performValidatorRegistration(manualLat, manualLng);
  };

  const performValidatorRegistration = async (lat?: number, lng?: number) => {
    console.log('🚀 Starting validator registration process...');
    setLoading(true);
    setLocationError('');

    try {
      // 1. Get user's geolocation (if not provided manually)
      let latitude: number;
      let longitude: number;

      if (lat !== undefined && lng !== undefined) {
        // Use manual coordinates
        latitude = lat;
        longitude = lng;
        console.log('📍 Using manual coordinates:', { latitude, longitude });
        addNotification(
          'Manual Location Set',
          `Using coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          'info'
        );
      } else {
        // Auto-detect location
        try {
          console.log('📍 Getting user location...');
          addNotification(
            'Getting Location',
            'Attempting to get your location for validator registration...',
            'info'
          );
          
          const position = await getCurrentPosition();
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          
          console.log('✅ Location obtained:', { 
            latitude, 
            longitude, 
            accuracy: position.coords.accuracy 
          });

          addNotification(
            'Location Obtained',
            `Location found with ${Math.round(position.coords.accuracy)}m accuracy`,
            'success'
          );
        } catch (locationErr: any) {
          const errorMessage = locationErr.message;

          let userFriendlyMessage = '';
          let helpText = '';
          
          switch (errorMessage) {
            case 'GEOLOCATION_NOT_SUPPORTED':
              userFriendlyMessage = 'Your browser does not support geolocation. Please use a modern browser.';
              helpText = 'Try using Chrome, Firefox, Safari, or Edge.';
              break;
            case 'PERMISSION_DENIED':
              userFriendlyMessage = 'Location permission was denied. Please enable location access and try again.';
              helpText = 'Click the location icon in your browser\'s address bar and allow location access.';
              break;
            case 'POSITION_UNAVAILABLE':
              userFriendlyMessage = 'Your location could not be determined after multiple attempts.';
              helpText = 'Please check your device settings, ensure location services are enabled, and try again.';
              break;
            case 'TIMEOUT':
              userFriendlyMessage = 'Location request timed out after multiple attempts.';
              helpText = 'Please check your internet connection and try again.';
              break;
            default:
              userFriendlyMessage = 'Unable to get your location after multiple attempts.';
              helpText = 'Please try again or check your device settings.';
          }

          console.error('❌ Location error after retries:', errorMessage);
          setLocationError(`${userFriendlyMessage}\n\n${helpText}`);
          addNotification('Location Error', userFriendlyMessage, 'error');
          setLoading(false);
          return;
        }
      }

      // 2. Generate a device ID
      const deviceId = 'device_' + Math.random().toString(36).substring(2, 10);
      console.log('🔧 Generated device ID:', deviceId);

      // 3. Create a validation message
      const message = `I am registering as a validator with device ${deviceId} at coordinates ${latitude.toFixed(6)},${longitude.toFixed(6)}`;

      // 4. Sign the message with the wallet
      if (!signMessage) {
        throw new Error("Wallet doesn't support message signing");
      }

      console.log('✍️ Signing message with wallet...');
      const messageBytes = new TextEncoder().encode(message);
      await signMessage(messageBytes);
      // Note: Signature verification would be done here if required by the backend
      
      // 6. Register as validator with the API
      console.log('📡 Sending registration to backend...');
      
      // Get user_id from localStorage for the request
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }

      const requestPayload = {
        user_id: userId,
        wallet_address: publicKey?.toString() || '',
        latitude,
        longitude,
        device_id: deviceId
      };
      
      console.log('📡 Request payload:', requestPayload);
      
      const response = await api.post('http://localhost:3001/validator/verify-validator', requestPayload);

      console.log('📡 Backend response:', response.data);

      if (response.data && response.data.status_code === 201) {
        console.log('✅ Validator registration response:', response.data);

        if (response.data.validator_data) {
          // New validator created successfully
          console.log('✅ New validator registration successful!');

          // Update localStorage with validator ID
          localStorage.setItem('validatorId', response.data.validator_data.validator_id);

          // Mark user as validated
          setValidated(true);

          addNotification(
            'Validator Registration Successful',
            'You are now registered as a validator. Connecting to the network...',
            'success'
          );

          // Establish WebSocket connection after successful registration
          await establishWebsocketConnection(response.data.validator_data.validator_id, latitude, longitude);
        } else {
          // Validator already exists from same device
          console.log('ℹ️ Validator already exists from this device');
          addNotification(
            'Validator Already Exists',
            response.data.message || 'A validator already exists from this device',
            'warning'
          );
          
          // Try to get validator ID from session status
          try {
            const sessionResponse = await axios.get('http://localhost:3001/user/session-status', {
              withCredentials: true
            });
            
            if (sessionResponse.data.validator_id) {
              localStorage.setItem('validatorId', sessionResponse.data.validator_id);
              console.log('✅ Retrieved existing validator ID from session');
            }
          } catch (error) {
            console.warn('⚠️ Could not retrieve validator ID from session:', error);
          }
          
          // Still mark as validated since they have a validator registration
          setValidated(true);
          setStep('complete');
        }
      } else {
        throw new Error(response.data.message || 'Failed to register as validator');
      }
    } catch (error: any) {
      console.error('❌ Validator registration error:', error);
      
      // Log detailed error information
      if (error.response) {
        console.error('❌ Response status:', error.response.status);
        console.error('❌ Response data:', error.response.data);
        console.error('❌ Response headers:', error.response.headers);
        
        // Show specific error message from server if available
        const errorMessage = error.response.data?.message || 
                            error.response.data?.detail || 
                            (typeof error.response.data === 'string' ? error.response.data : null) ||
                            'Could not register as a validator. Please try again.';
        addNotification(
          'Registration Failed',
          errorMessage,
          'error'
        );
      } else if (error.request) {
        console.error('❌ Request error:', error.request);
        addNotification(
          'Registration Failed',
          'Network error. Please check your connection and try again.',
          'error'
        );
      } else {
        console.error('❌ Error message:', error.message);
        addNotification(
          'Registration Failed',
          'Could not register as a validator. Please try again.',
          'error'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleValidatorRegistration = async () => {
    if (!connected || !publicKey) {
      setStep('connect');
      return;
    }

    await performValidatorRegistration();
  };

  const handleRetryLocation = () => {
    setLocationError('');
    console.log('🔄 User requested location retry');
    addNotification(
      'Retrying Location',
      'Retrying location request with improved settings...',
      'info'
    );
    handleValidatorRegistration();
  };

  const handleRetryWebSocket = async () => {
    if (publicKey) {
      // Get location again for retry
      try {
        const position = await getCurrentPosition();
        await establishWebsocketConnection(
          publicKey.toString(),
          position.coords.latitude,
          position.coords.longitude
        );
      } catch (error) {
        console.error('❌ Failed to retry WebSocket connection:', error);
        addNotification(
          'Retry Failed',
          'Could not establish connection. You can continue without real-time features.',
          'general'
        );
      }
    }
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="max-w-lg mx-auto"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Become a Validator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-muted-foreground">
            Validators contribute to the network by providing computing resources and data validation. In return, you earn rewards in SOL tokens.
          </div>

          {step === 'connect' && (
            <motion.div variants={slideUp} className="space-y-4">
              <div className="p-4 bg-secondary/30 rounded-lg">
                <h3 className="font-medium mb-2">Step 1: Connect Your Wallet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  To become a validator, you'll need to connect your Solana wallet. This wallet will receive your rewards.
                </p>
                <Button
                  onClick={handleConnectWallet}
                  className="w-full bg-primary"
                  disabled={loading}
                >
                  {connected ? 'Wallet Connected, Continue' : 'Connect Wallet'}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'validate' && (
            <motion.div variants={slideUp} className="space-y-4">
              <div className="p-4 bg-secondary/30 rounded-lg">
                <h3 className="font-medium mb-2">Step 2: Register as Validator</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your wallet is connected. Now we need to register you as a validator on the network. This will require your location to help verify your identity.
                </p>

                {locationError && (
                  <div className="mb-4 p-3 bg-destructive/20 border border-destructive/30 rounded-md">
                    <div className="text-destructive text-sm font-medium mb-2">Location Error</div>
                    <div className="text-destructive text-sm mb-3 whitespace-pre-line">{locationError}</div>
                    
                    {!showManualLocation ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button
                            onClick={handleRetryLocation}
                            size="sm"
                            variant="outline"
                            className="border-destructive text-destructive hover:bg-destructive/10"
                            disabled={loading}
                          >
                            Retry Auto-Detection
                          </Button>
                          <Button
                            onClick={() => setShowManualLocation(true)}
                            size="sm"
                            variant="outline"
                            className="border-amber-500 text-amber-600 hover:bg-amber-500/10"
                          >
                            Enter Manually
                          </Button>
                        </div>
                        <Button
                          onClick={() => window.location.reload()}
                          size="sm"
                          variant="outline"
                          className="w-full border-destructive text-destructive hover:bg-destructive/10"
                        >
                          Refresh Page
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-amber-600 text-xs font-medium">
                          Manual Location Entry
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="Latitude (e.g., 40.7128)"
                            value={manualLat}
                            onChange={(e) => setManualLat(e.target.value)}
                            className="px-2 py-1 text-xs border border-amber-300 rounded"
                            step="any"
                          />
                          <input
                            type="number"
                            placeholder="Longitude (e.g., -74.0060)"
                            value={manualLng}
                            onChange={(e) => setManualLng(e.target.value)}
                            className="px-2 py-1 text-xs border border-amber-300 rounded"
                            step="any"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              const lat = parseFloat(manualLat);
                              const lng = parseFloat(manualLng);
                              if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                                setLocationError('');
                                setShowManualLocation(false);
                                handleValidatorRegistrationWithManualLocation(lat, lng);
                              } else {
                                addNotification('Invalid Coordinates', 'Please enter valid latitude (-90 to 90) and longitude (-180 to 180)', 'error');
                              }
                            }}
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                            disabled={loading || !manualLat || !manualLng}
                          >
                            Use Manual Location
                          </Button>
                          <Button
                            onClick={() => {
                              setShowManualLocation(false);
                              setManualLat('');
                              setManualLng('');
                            }}
                            size="sm"
                            variant="outline"
                            className="border-gray-400 text-gray-600"
                          >
                            Cancel
                          </Button>
                        </div>
                        <div className="text-xs text-amber-600">
                          You can find your coordinates at <a href="https://www.latlong.net/" target="_blank" rel="noopener noreferrer" className="underline">latlong.net</a>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleValidatorRegistration}
                  className="w-full bg-primary"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register as Validator'}
                </Button>

                <div className="mt-3 text-xs text-muted-foreground">
                  <strong>Troubleshooting:</strong> If you're having location issues, please:
                  <ul className="mt-1 ml-4 list-disc">
                    <li>Allow location access when prompted</li>
                    <li>Check your browser's location settings</li>
                    <li>Ensure location services are enabled on your device</li>
                    <li>Try using HTTPS if you're on HTTP</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'socket-connecting' && (
            <motion.div variants={slideUp} className="space-y-4">
              <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <h3 className="font-medium text-blue-400 mb-2">Step 3: Connecting to Validator Network</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Establishing real-time connection to the validator network...
                </p>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">
                    {socketStatus.connecting ? 'Connecting to network...' :
                      socketStatus.connected ? 'Connected successfully!' :
                        socketStatus.error ? 'Connection failed' : 'Preparing connection...'}
                  </span>
                </div>

                {socketStatus.error && (
                  <div className="space-y-3">
                    <div className="text-sm text-amber-400 bg-amber-500/20 p-2 rounded">
                      Network connection failed, but you can still use the platform.
                      Real-time features may be limited.
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button
                        onClick={handleRetryWebSocket}
                        size="sm"
                        variant="outline"
                        className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                        disabled={socketStatus.connecting}
                      >
                        Retry Connection
                      </Button>
                      <Button
                        onClick={() => setStep('complete')}
                        size="sm"
                        variant="outline"
                      >
                        Continue Anyway
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 'complete' && (
            <motion.div variants={slideUp} className="space-y-4">
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-center">
                <div className="text-emerald-400 text-4xl mb-2">🎉</div>
                <h3 className="font-medium text-emerald-400 mb-2">Registration Complete!</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  You are now registered as a validator and can start contributing to the network.
                </p>

                {/* WebSocket connection status */}
                <div className="text-xs bg-secondary/50 rounded p-2 mb-3">
                  <div className="font-medium mb-1">Network Status:</div>
                  <div className="flex items-center justify-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${socketStatus.connected ? 'bg-emerald-500' :
                      socketStatus.error ? 'bg-amber-500' : 'bg-gray-500'
                      }`}></div>
                    <span className="text-muted-foreground">
                      {socketStatus.connected ? 'Connected to validator network' :
                        socketStatus.error ? 'Limited connectivity (offline mode)' :
                          'Network connection not established'}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    console.log('🏠 Redirecting to validator dashboard');
                    onComplete?.(); // Close the modal if callback provided
                    router.push('/home/validator');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Continue to Validator Dashboard
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border">
          <div className="text-xs text-muted-foreground">
            By becoming a validator, you agree to our Terms of Service and Privacy Policy.
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ValidatorRegistration;