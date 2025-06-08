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
import bs58 from 'bs58';

interface WebSocketConnectionStatus {
  connected: boolean;
  connecting: boolean;
  error: string | null;
}

const ValidatorRegistration = () => {
  const router = useRouter();
  const { connected, publicKey, signMessage } = useWallet();
  const { setVisible } = useWalletModal();
  const { setValidated } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState<string>('');
  const [step, setStep] = useState<'connect' | 'validate' | 'socket-connecting' | 'complete'>('connect');
  const [socketStatus, setSocketStatus] = useState<WebSocketConnectionStatus>({
    connected: false,
    connecting: false,
    error: null
  });
  const websocketRef = useRef<WebSocket | null>(null);

  // Check if wallet is connected when component mounts or when connection status changes
  useEffect(() => {
    console.log('🔗 Wallet connection status:', { connected, publicKey: publicKey?.toString() });
    if (connected && publicKey) {
      setStep('validate');
    }
  }, [connected, publicKey]);

  // Cleanup WebSocket connection on component unmount
  useEffect(() => {
    return () => {
      if (websocketRef.current) {
        console.log('🧹 Cleaning up WebSocket connection');
        websocketRef.current.close();
      }
    };
  }, []);

  const handleConnectWallet = async () => {
    if (!connected) {
      console.log('💼 Opening wallet modal');
      setVisible(true);
    } else {
      setStep('validate');
    }
  };

  // Helper function to get current position with better error handling
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('GEOLOCATION_NOT_SUPPORTED'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(position);
        },
        (error) => {
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
          reject(new Error(errorMessage));
        },
        options
      );
    });
  };

  const establishWebsocketConnection = async (validatorId: string, latitude: number, longitude: number) => {
    console.log('🔌 Starting WebSocket connection process...');
    setStep('socket-connecting');
    setSocketStatus({
      connected: false,
      connecting: true, // Set to true when starting connection
      error: null
    });

    try {
      // Fixed WebSocket URL - added missing port number
      const wsUrl = 'ws://127.0.0.1:3001/ws/upgrade';
      console.log('🌐 Connecting to WebSocket:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      websocketRef.current = ws;

      // Set connection timeout
      const connectionTimeout = setTimeout(() => {
        console.log('⏰ WebSocket connection timeout');
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.close();
          setSocketStatus({
            connected: false,
            connecting: false,
            error: 'Connection timeout'
          });
          addNotification(
            'Connection Timeout',
            'WebSocket connection timed out. You can continue without real-time features.'
          );
          setTimeout(() => setStep('complete'), 1000);
        }
      }, 10000); // 10 second timeout

      ws.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        clearTimeout(connectionTimeout);
        setSocketStatus({ connected: true, connecting: false, error: null });

        // NOW send the registration message - only after connection is open
        const registrationMessage = {
          RegisterValidator: {
            validator_id: validatorId,
            location: {
              latitude,
              longitude
            }
          }
        };

        console.log('📨 Sending validator registration:', registrationMessage);
        ws.send(JSON.stringify(registrationMessage));

        addNotification(
          'Network Connection Established',
          'Successfully connected to the validator network.'
        );

        // Move to complete step after successful connection
        setTimeout(() => {
          setStep('complete');
        }, 2000);
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        clearTimeout(connectionTimeout);
        setSocketStatus({ connected: false, connecting: false, error: null });
        
        if (event.code !== 1000) { // 1000 is normal closure
          console.log('⚠️ WebSocket closed unexpectedly');
          addNotification(
            'Connection Lost',
            'Lost connection to validator network. You can continue in offline mode.'
          );
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        clearTimeout(connectionTimeout);
        setSocketStatus({
          connected: false,
          connecting: false,
          error: 'Failed to connect to validator network'
        });

        addNotification(
          'Network Connection Failed',
          'Could not connect to the validator network. You can continue without real-time features.'
        );

        // Move to complete step even if WebSocket fails
        setTimeout(() => {
          setStep('complete');
        }, 2000);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📨 Received WebSocket message:', message);

          if (message.url) {
            console.log('🌐 Received website monitoring task:', message.url);
            addNotification(
              'New Monitoring Task',
              `New website to monitor: ${message.url}`
            );
          }
        } catch (e) {
          console.error('❌ Error parsing WebSocket message:', e);
        }
      };

    } catch (error) {
      console.error('❌ Error establishing WebSocket connection:', error);
      setSocketStatus({
        connected: false,
        connecting: false,
        error: 'Failed to establish connection'
      });

      addNotification(
        'Network Connection Error',
        'Could not establish network connection. You can continue without real-time features.'
      );

      setTimeout(() => {
        setStep('complete');
      }, 2000);
    }
  };

  const handleValidatorRegistration = async () => {
    if (!connected || !publicKey) {
      setStep('connect');
      return;
    }

    console.log('🚀 Starting validator registration process...');
    setLoading(true);
    setLocationError('');

    try {
      // 1. Get user's geolocation
      let latitude: number;
      let longitude: number;

      try {
        console.log('📍 Getting user location...');
        const position = await getCurrentPosition();
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        console.log('✅ Location obtained:', { latitude, longitude });
      } catch (locationErr: any) {
        const errorMessage = locationErr.message;

        let userFriendlyMessage = '';
        switch (errorMessage) {
          case 'GEOLOCATION_NOT_SUPPORTED':
            userFriendlyMessage = 'Your browser does not support geolocation. Please use a modern browser.';
            break;
          case 'PERMISSION_DENIED':
            userFriendlyMessage = 'Location permission was denied. Please enable location access and try again.';
            break;
          case 'POSITION_UNAVAILABLE':
            userFriendlyMessage = 'Your location could not be determined. Please check your device settings.';
            break;
          case 'TIMEOUT':
            userFriendlyMessage = 'Location request timed out. Please try again.';
            break;
          default:
            userFriendlyMessage = 'Unable to get your location. Please try again.';
        }

        console.error('❌ Location error:', errorMessage);
        setLocationError(userFriendlyMessage);
        addNotification('Location Error', userFriendlyMessage);
        setLoading(false);
        return;
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
      const signature = await signMessage(messageBytes);
      const signatureBase58 = bs58.encode(signature);

      // 5. Register as validator with the API
      console.log('📡 Sending registration to backend...');
      const response = await axios.post('http://127.0.0.1:3001/validator/verify-validator', {
        wallet_address: publicKey.toString(),
        latitude,
        longitude,
        device_id: deviceId,
        signature: signatureBase58,
        message: message
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      console.log('📡 Backend response:', response.data);

      if (response.data && response.data.status_code === 201) {
        console.log('✅ Validator registration successful!');
        
        // Mark user as validated
        setValidated(true);

        addNotification(
          'Validator Registration Successful',
          'You are now registered as a validator. Connecting to the network...'
        );

        // Establish WebSocket connection after successful registration
        // Use the publicKey as validator ID since that's what we're using
        await establishWebsocketConnection(publicKey.toString(), latitude, longitude);
      } else {
        throw new Error(response.data.message || 'Failed to register as validator');
      }
    } catch (error) {
      console.error('❌ Validator registration error:', error);
      addNotification(
        'Registration Failed',
        'Could not register as a validator. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRetryLocation = () => {
    setLocationError('');
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
          'Could not establish connection. You can continue without real-time features.'
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
                    <div className="text-destructive text-sm mb-3">{locationError}</div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleRetryLocation}
                        size="sm"
                        variant="outline"
                        className="border-destructive text-destructive hover:bg-destructive/10"
                        disabled={loading}
                      >
                        Retry
                      </Button>
                      <Button
                        onClick={() => window.location.reload()}
                        size="sm"
                        variant="outline"
                        className="border-destructive text-destructive hover:bg-destructive/10"
                      >
                        Refresh Page
                      </Button>
                    </div>
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
                    <div className={`w-2 h-2 rounded-full ${
                      socketStatus.connected ? 'bg-emerald-500' : 
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
                    console.log('🏠 Redirecting to dashboard');
                    router.push('/home');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Continue to Dashboard
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