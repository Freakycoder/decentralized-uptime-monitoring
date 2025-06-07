import { useState, useEffect } from 'react';
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

const ValidatorRegistration = () => {
  const router = useRouter();
  const { connected, publicKey, signMessage } = useWallet();
  const { setVisible } = useWalletModal();
  const { setValidated } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState<string>('');
  const [step, setStep] = useState<'connect' | 'validate' | 'complete'>('connect');

  // Check if wallet is connected when component mounts or when connection status changes
  useEffect(() => {
    if (connected && publicKey) {
      setStep('validate');
    }
  }, [connected, publicKey]);

  const handleConnectWallet = async () => {
    if (!connected) {
      // Open the wallet modal for connection
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
        timeout: 10000, // 10 seconds timeout
        maximumAge: 60000 // Accept a cached position that's up to 1 minute old
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

  const handleValidatorRegistration = async () => {
    if (!connected || !publicKey) {
      setStep('connect');
      return;
    }

    setLoading(true);
    setLocationError('');

    try {
      // 1. Get user's geolocation with better error handling
      let latitude: number;
      let longitude: number;

      try {
        const position = await getCurrentPosition();
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
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
        
        setLocationError(userFriendlyMessage);
        addNotification(
          'Location Error',
          userFriendlyMessage
        );
        setLoading(false);
        return;
      }

      // 2. Generate a device ID - in a real app, this would be more robust
      const deviceId = 'device_' + Math.random().toString(36).substring(2, 10);

      // 3. Create a validation message
      const message = `I am registering as a validator with device ${deviceId} at coordinates ${latitude.toFixed(6)},${longitude.toFixed(6)}`;

      // 4. Sign the message with the wallet
      if (!signMessage) {
        throw new Error("Wallet doesn't support message signing");
      }

      // Convert the message to Uint8Array and sign it
      const messageBytes = new TextEncoder().encode(message);
      const signature = await signMessage(messageBytes);
      const signatureBase58 = bs58.encode(signature);

      // 5. Register as validator
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

      if (response.data && response.data.status_code === 201) {
        // Mark user as validated
        setValidated(true);
        setStep('complete');

        // Add a notification
        addNotification(
          'Validator Registration Successful',
          'You are now registered as a validator and can contribute to the network.'
        );

        // Redirect to home page
        setTimeout(() => {
          router.push('/home');
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Failed to register as validator');
      }
    } catch (error) {
      console.error('Validator registration error:', error);
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

          {step === 'complete' && (
            <motion.div variants={slideUp} className="space-y-4">
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-center">
                <div className="text-emerald-400 text-4xl mb-2">🎉</div>
                <h3 className="font-medium text-emerald-400 mb-2">Registration Complete!</h3>
                <p className="text-sm text-muted-foreground">
                  You are now registered as a validator. You can start contributing to the network and earning rewards.
                </p>
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