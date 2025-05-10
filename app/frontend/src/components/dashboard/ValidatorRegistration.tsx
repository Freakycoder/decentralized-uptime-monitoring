import { useState } from 'react';
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
import { bs58 } from '@solana/web3.js';

const ValidatorRegistration = () => {
  const router = useRouter();
  const { connected, publicKey, signMessage } = useWallet();
  const { setVisible } = useWalletModal();
  const { setValidated } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'connect' | 'validate' | 'complete'>('connect');

  const handleConnectWallet = async () => {
    if (!connected) {
      // Open the wallet modal for connection
      setVisible(true);
      
      // We'll check if connected in useEffect
      if (connected && publicKey) {
        setStep('validate');
      }
    } else {
      setStep('validate');
    }
  };

  const handleValidatorRegistration = async () => {
    if (!connected || !publicKey) {
      setStep('connect');
      return;
    }

    setLoading(true);

    try {
      // 1. Get user's geolocation
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      // 2. Generate a device ID - in a real app, this would be more robust
      const deviceId = 'device_' + Math.random().toString(36).substring(2, 10);

      // 3. Get user ID from localStorage for demo purposes
      const userId = localStorage.getItem('userEmail') || 'user_' + Math.random().toString(36).substring(2, 10);

      // 4. Create a validation message
      const message = `I am registering as a validator with device ${deviceId} at coordinates ${latitude.toFixed(6)},${longitude.toFixed(6)}`;
      
      // 5. Sign the message with the wallet
      if (!signMessage) {
        throw new Error("Wallet doesn't support message signing");
      }
      
      // Convert the message to Uint8Array and sign it
      const messageBytes = new TextEncoder().encode(message);
      const signature = await signMessage(messageBytes);
      const signatureBase58 = bs58.encode(signature);
      
      // 6. Register as validator
      const response = await axios.post('http://127.0.0.1:3001/validator/verify-validator', {
        user_id: userId,
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
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/');
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

  // Helper function to get current position
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
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
                <Button 
                  onClick={handleValidatorRegistration} 
                  className="w-full bg-primary"
                  disabled={loading}
                >
                  {loading ? 'Registering...' : 'Register as Validator'}
                </Button>
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