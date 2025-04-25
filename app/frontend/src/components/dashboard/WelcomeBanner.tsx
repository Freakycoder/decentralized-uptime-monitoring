import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { fadeIn } from '../../lib/framer-variants';

interface WelcomeBannerProps {
  username?: string;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ username = 'there' }) => {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden mb-8 rounded-lg border border-border bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent p-6 shadow-sm"
    >
      {/* Decorative elements */}
      <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
      
      <div className="relative z-10">
        <h2 className="mb-1 text-2xl font-bold">
          Hi {username}, Welcome to Digital Data Contribution Network
        </h2>
        
        <p className="mb-6 max-w-3xl text-muted-foreground">
          Turn your devices into passive income generators by contributing valuable digital data. 
          Select a contribution method below to get started or view your current earnings.
        </p>
        
        <div className="flex flex-wrap gap-4">
          <Button>
            Add a New Device
          </Button>
          
          <Button variant="outline">
            View Documentation
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeBanner;
