import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useAuth } from '../../contexts/AuthContext';
import { fadeIn, slideUp } from '../../lib/framer-variants';
import api from '@/lib/axios';

interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy?: number;
  source: 'gps' | 'ip' | 'manual';
}

interface LocationProgress {
  step: string;
  message: string;
  isError: boolean;
}

interface ValidatorRegistrationProps {
  onComplete?: () => void;
}

const ValidatorRegistration = ({ onComplete }: ValidatorRegistrationProps = {}) => {
  const router = useRouter();
  const { connected, publicKey, signMessage } = useWallet();
  const { setVisible } = useWalletModal();
  const { setValidated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState<string>('');
  const [locationProgress, setLocationProgress] = useState<LocationProgress | null>(null);
  const [step, setStep] = useState<'connect' | 'validate' | 'complete'>('connect');
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

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

  // Improved location retrieval with multiple fallback strategies
  const getLocationWithFallbacks = async (): Promise<LocationResult> => {
    // Strategy 1: Try GPS/Network location (most accurate)
    try {
      const gpsLocation = await getGPSLocation();
      return {
        latitude: gpsLocation.latitude,
        longitude: gpsLocation.longitude,
        accuracy: gpsLocation.accuracy,
        source: 'gps'
      };
    } catch (gpsError) {
      console.log('📍 GPS location failed, trying IP fallback...', gpsError);
    }

    // Strategy 2: Try IP-based location (less accurate but more reliable)
    try {
      const ipLocation = await getIPLocation();
      return {
        latitude: ipLocation.latitude,
        longitude: ipLocation.longitude,
        source: 'ip'
      };
    } catch (ipError) {
      console.log('🌐 IP location failed', ipError);
      throw new Error('Both GPS and IP location failed. Please enter your location manually.');
    }
  };

  // Enhanced GPS location with better retry logic
  const getGPSLocation = async (): Promise<{ latitude: number; longitude: number; accuracy: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      setLocationProgress({
        step: 'gps',
        message: 'Requesting location permission...',
        isError: false
      });

      const timeout = 30000; // 30 seconds - more generous timeout
      let attemptCount = 0;
      const maxAttempts = 3;

      const tryGetLocation = () => {
        attemptCount++;
        
        setLocationProgress({
          step: 'gps',
          message: `Getting your location... (attempt ${attemptCount}/${maxAttempts})`,
          isError: false
        });

        // Progressive options: start with high accuracy, then relax requirements
        const options: PositionOptions = {
          enableHighAccuracy: attemptCount === 1, // Only use high accuracy on first try
          timeout: timeout / attemptCount, // Reduce timeout on retries
          maximumAge: attemptCount === 1 ? 60000 : 300000 // Allow older cache on retries
        };

        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('✅ GPS location obtained:', {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            });

            setLocationProgress({
              step: 'gps',
              message: `Location found with ${Math.round(position.coords.accuracy)}m accuracy`,
              isError: false
            });

            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
          },
          (error) => {
            console.warn(`⚠️ GPS attempt ${attemptCount} failed:`, error.message);

            if (error.code === error.PERMISSION_DENIED) {
              setLocationProgress({
                step: 'gps',
                message: 'Location permission denied. Trying alternative method...',
                isError: true
              });
              reject(new Error('Location permission denied by user'));
              return;
            }

            if (attemptCount < maxAttempts) {
              // Retry with more relaxed settings
              setTimeout(tryGetLocation, 1000);
            } else {
              setLocationProgress({
                step: 'gps',
                message: 'GPS location failed. Trying IP-based location...',
                isError: true
              });
              reject(new Error(`GPS location failed after ${maxAttempts} attempts: ${error.message}`));
            }
          },
          options
        );
      };

      tryGetLocation();
    });
  };

  // IP-based location fallback using multiple services
  const getIPLocation = async (): Promise<{ latitude: number; longitude: number }> => {
    setLocationProgress({
      step: 'ip',
      message: 'Getting approximate location from IP address...',
      isError: false
    });

    const ipServices = [
      'https://ipapi.co/json/',
      'https://api.ipgeolocation.io/ipgeo?apiKey=free',
      'https://freegeoip.app/json/',
      'https://ipinfo.io/json'
    ];

    for (const service of ipServices) {
      try {
        console.log(`🌐 Trying IP service: ${service}`);
        
        const response = await fetch(service, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        
        // Handle different response formats
        let latitude: number, longitude: number;
        
        if (data.latitude && data.longitude) {
          latitude = parseFloat(data.latitude);
          longitude = parseFloat(data.longitude);
        } else if (data.lat && data.lon) {
          latitude = parseFloat(data.lat);
          longitude = parseFloat(data.lon);
        } else if (data.loc) {
          // ipinfo.io format
          const [lat, lon] = data.loc.split(',');
          latitude = parseFloat(lat);
          longitude = parseFloat(lon);
        } else {
          throw new Error('Invalid response format');
        }

        if (isNaN(latitude) || isNaN(longitude)) {
          throw new Error('Invalid coordinates received');
        }

        console.log(`✅ IP location from ${service}:`, { latitude, longitude });
        
        setLocationProgress({
          step: 'ip',
          message: `Approximate location found (${data.city || 'Unknown city'}, ${data.country || 'Unknown country'})`,
          isError: false
        });

        return { latitude, longitude };
      } catch (error) {
        console.warn(`❌ IP service ${service} failed:`, error);
        continue;
      }
    }

    throw new Error('All IP location services failed');
  };

  const handleValidatorRegistrationWithManualLocation = async (manualLat: number, manualLng: number) => {
    await performValidatorRegistration(manualLat, manualLng, 'manual');
  };

  const performValidatorRegistration = async (lat?: number, lng?: number, source?: 'manual' | 'gps' | 'ip') => {
    console.log('🚀 Starting validator registration process...');
    setLoading(true);
    setLocationError('');
    setLocationProgress(null);

    try {
      // 1. Get user's location
      let location: LocationResult;

      if (lat !== undefined && lng !== undefined) {
        // Use manual coordinates
        location = {
          latitude: lat,
          longitude: lng,
          source: source || 'manual'
        };
        console.log('📍 Using manual coordinates:', location);
      } else {
        // Auto-detect location with fallbacks
        try {
          location = await getLocationWithFallbacks();
          console.log('✅ Location obtained:', location);
        } catch (locationErr: any) {
          console.error('❌ All location methods failed:', locationErr);
          setLocationError(
            'Unable to determine your location automatically. Please:\n\n' +
            '1. Check that location services are enabled on your device\n' +
            '2. Allow location access when prompted by your browser\n' +
            '3. Try refreshing the page and allowing location access\n' +
            '4. Use the "Enter Manually" option below\n\n' +
            'If you\'re using a VPN, it may interfere with location detection.'
          );
          setLocationProgress(null);
          setLoading(false);
          return;
        }
      }

      // Clear progress indicator
      setLocationProgress(null);

      // 2. Generate a device ID
      const deviceId = 'device_' + Math.random().toString(36).substring(2, 10);
      console.log('🔧 Generated device ID:', deviceId);

      // 3. Create a validation message
      const message = `I am registering as a validator with device ${deviceId} at coordinates ${location.latitude.toFixed(6)},${location.longitude.toFixed(6)}`;

      // 4. Sign the message with the wallet
      if (!signMessage) {
        throw new Error("Wallet doesn't support message signing");
      }

      console.log('✍️ Signing message with wallet...');
      const messageBytes = new TextEncoder().encode(message);
      await signMessage(messageBytes);
      
      // 5. Register as validator with the API
      console.log('📡 Sending registration to backend...');
      
      // Get user_id from localStorage for the request
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }

      const requestPayload = {
        user_id: userId,
        wallet_address: publicKey?.toString() || '',
        latitude: location.latitude,
        longitude: location.longitude,
        device_id: deviceId
      };
      
      console.log('📡 Request payload:', requestPayload);
      
      const response = await api.post('/validator/verify-validator', requestPayload);

      console.log('📡 Backend response:', response.data);

      if (response.data && response.data.status_code === 201) {
        console.log('✅ Validator registration response:', response.data);

        if (response.data.validator_data) {
          // New validator created successfully
          console.log('✅ New validator registration successful!');

          // Update localStorage with validator ID
          localStorage.setItem('validatorId', response.data.validator_data.validator_id);

          // Update JWT token if provided
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            console.log('🔑 Updated JWT token with validator_id');
          }

          // Mark user as validated
          setValidated(true);

          console.log('🎉 Validator registration completed successfully!');
          setStep('complete');
        } else {
          // Validator already exists from same device
          console.log('ℹ️ Validator already exists from this device');
          
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
        
        // Show specific error message from server if available
        const errorMessage = error.response.data?.message || 
                            error.response.data?.detail || 
                            (typeof error.response.data === 'string' ? error.response.data : null) ||
                            'Could not register as a validator. Please try again.';
        
        setLocationError(`Registration failed: ${errorMessage}`);
      } else if (error.request) {
        console.error('❌ Request error:', error.request);
        setLocationError('Network error. Please check your connection and try again.');
      } else {
        console.error('❌ Error message:', error.message);
        setLocationError('Could not register as a validator. Please try again.');
      }
    } finally {
      setLoading(false);
      setLocationProgress(null);
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
    setLocationProgress(null);
    console.log('🔄 User requested location retry');
    handleValidatorRegistration();
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
            Validators contribute to the network by monitoring websites and providing data validation. In return, you earn rewards in SOL tokens.
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

                {/* Location Progress Indicator */}
                {locationProgress && (
                  <div className={`mb-4 p-3 rounded-md border ${
                    locationProgress.isError 
                      ? 'bg-amber-50 border-amber-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      {!locationProgress.isError && (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {locationProgress.step === 'gps' ? 'Getting Precise Location' : 
                           locationProgress.step === 'ip' ? 'Getting Approximate Location' : 
                           'Processing Location'}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {locationProgress.message}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                            Retry Location
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
                          className="w-full border-gray-400 text-gray-600 hover:bg-gray-50"
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
                            className="px-3 py-2 text-sm border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                            step="any"
                          />
                          <input
                            type="number"
                            placeholder="Longitude (e.g., -74.0060)"
                            value={manualLng}
                            onChange={(e) => setManualLng(e.target.value)}
                            className="px-3 py-2 text-sm border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                                setLocationError('Please enter valid coordinates:\n• Latitude: -90 to 90\n• Longitude: -180 to 180');
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
                          💡 Find your coordinates at <a href="https://www.latlong.net/" target="_blank" rel="noopener noreferrer" className="underline font-medium">latlong.net</a>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleValidatorRegistration}
                  className="w-full bg-primary"
                  disabled={loading || !!locationProgress}
                >
                  {loading ? 'Registering...' : 
                   locationProgress ? 'Getting Location...' : 
                   'Register as Validator'}
                </Button>

                <div className="mt-4 text-xs text-muted-foreground">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="font-medium mb-2">📍 Location Detection Process:</div>
                    <div className="space-y-1">
                      <div>1. First, we try to get your precise GPS location</div>
                      <div>2. If that fails, we use your IP address for approximate location</div>
                      <div>3. If both fail, you can enter coordinates manually</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'complete' && (
            <motion.div variants={slideUp} className="space-y-4">
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-center">
                <div className="text-emerald-400 text-4xl mb-2">🎉</div>
                <h3 className="font-medium text-emerald-400 mb-2">Registration Complete!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You are now registered as a validator! You can now access the validator dashboard to start monitoring websites and earning rewards.
                </p>

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