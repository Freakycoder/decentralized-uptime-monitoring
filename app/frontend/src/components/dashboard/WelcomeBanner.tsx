import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { fadeIn, slideUp, staggerContainer } from '../../lib/framer-variants';
import { useAuth } from '../../contexts/AuthContext';
import { Globe, Shield, ArrowRight, Clock, DollarSign, Award } from 'lucide-react';

const WelcomeBanner: React.FC = () => {
  const router = useRouter();
  const { isValidated } = useAuth();
  const [selectedPath, setSelectedPath] = useState<'user' | 'validator' | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // If user is already validated as validator, show validator-specific welcome
  if (isValidated) {
    return (
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden mb-8 rounded-lg border border-border bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-transparent p-6 shadow-sm"
      >
        <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-emerald-500" />
            <h2 className="text-2xl font-bold">Welcome back, Validator!</h2>
          </div>
          
          <p className="mb-6 max-w-3xl text-muted-foreground">
            You're connected to the validator network and earning rewards by monitoring websites. 
            Your contributions help maintain the reliability of the internet infrastructure.
          </p>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-emerald-400">Validator Active</span>
            </div>
            <div className="text-muted-foreground">
              Monitoring network traffic and earning SOL rewards
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const handlePathSelection = (path: 'user' | 'validator') => {
    setSelectedPath(path);
    setShowConfirmation(true);
  };

  const confirmSelection = () => {
    if (selectedPath === 'user') {
      // Redirect to website monitoring setup
      router.push('/website-monitor');
    } else if (selectedPath === 'validator') {
      // This will trigger the validator registration flow
      // The auth context will handle showing ValidatorRegistration component
      setShowConfirmation(false);
      // You would set some state here to trigger validator registration
      // For now, we'll just show a message
      alert('Validator registration will be implemented');
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mb-8 space-y-6"
    >
      {/* Main welcome message */}
      <motion.div
        variants={fadeIn}
        className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent p-6 shadow-sm"
      >
        <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative z-10">
          <h2 className="mb-2 text-2xl font-bold">
            Welcome to Website Monitoring Network
          </h2>
          <p className="mb-6 max-w-3xl text-muted-foreground">
            Choose how you'd like to participate in our decentralized website monitoring network. 
            You can either monitor your own websites or help others by becoming a validator.
          </p>
        </div>
      </motion.div>

      {!showConfirmation ? (
        /* Path selection cards */
        <motion.div
          variants={slideUp}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Website Owner Path */}
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
              selectedPath === 'user' ? 'border-blue-500 bg-blue-500/5' : 'border-border'
            }`}
            onClick={() => handlePathSelection('user')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                <Globe className="h-8 w-8 text-blue-500" />
              </div>
              <CardTitle className="text-xl">Monitor Your Websites</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-center">
                Get real-time monitoring for your websites with detailed uptime, 
                performance metrics, and instant alerts.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">24/7 uptime monitoring</span>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">Pay per monitoring hours</span>
                </div>
                <div className="flex items-center gap-3">
                  <ArrowRight className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">Real-time performance insights</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Starting from</div>
                  <div className="text-lg font-bold text-blue-500">$0.01/hour</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validator Path */}
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
              selectedPath === 'validator' ? 'border-emerald-500 bg-emerald-500/5' : 'border-border'
            }`}
            onClick={() => handlePathSelection('validator')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-emerald-500" />
              </div>
              <CardTitle className="text-xl">Become a Validator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-center">
                Earn SOL rewards by helping monitor websites across the network. 
                Contribute your computing resources and get paid.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm">Earn SOL rewards</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm">Passive income generation</span>
                </div>
                <div className="flex items-center gap-3">
                  <ArrowRight className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm">Support network infrastructure</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Potential earnings</div>
                  <div className="text-lg font-bold text-emerald-500">0.05+ SOL/day</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        /* Confirmation step */
        <motion.div
          variants={slideUp}
          className="max-w-2xl mx-auto"
        >
          <Card className="border-2 border-amber-500 bg-amber-500/5">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
                {selectedPath === 'user' ? (
                  <Globe className="h-8 w-8 text-amber-500" />
                ) : (
                  <Shield className="h-8 w-8 text-amber-500" />
                )}
              </div>
              <CardTitle className="text-xl">Confirm Your Choice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-lg">
                  You've selected: <strong>
                    {selectedPath === 'user' ? 'Website Monitoring' : 'Validator Network'}
                  </strong>
                </p>
                <p className="text-muted-foreground text-sm">
                  {selectedPath === 'user' 
                    ? 'You\'ll be able to add websites for monitoring and pay for the service.'
                    : 'You\'ll join the validator network and earn rewards by monitoring websites.'
                  }
                </p>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="text-amber-500 mt-0.5">⚠️</div>
                  <div className="space-y-1">
                    <div className="font-medium text-amber-700 dark:text-amber-400">
                      Important: This choice is permanent
                    </div>
                    <div className="text-sm text-amber-600 dark:text-amber-300">
                      Once you select a path, you cannot switch to the other option. 
                      Choose carefully based on your needs.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setShowConfirmation(false)}
                >
                  Go Back
                </Button>
                <Button 
                  onClick={confirmSelection}
                  className={selectedPath === 'user' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}
                >
                  {selectedPath === 'user' ? 'Start Monitoring' : 'Join Validator Network'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WelcomeBanner;