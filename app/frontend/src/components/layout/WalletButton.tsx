import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet } from 'lucide-react';
import { Button } from '../ui/button';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { truncate } from '../../lib/utils';

const WalletButton = () => {
  const { connected, connecting, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleConnect = () => {
    if (connected) {
      setShowDropdown(!showDropdown);
    } else {
      setVisible(true);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setShowDropdown(false);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  return (
    <div className="relative">
      <Button
        variant={connected ? "outline" : "default"}
        size="sm"
        className="gap-2 min-w-[140px]"
        onClick={handleConnect}
        disabled={connecting}
      >
        <Wallet className="h-4 w-4" />
        {connecting ? (
          "Connecting..."
        ) : connected && publicKey ? (
          truncate(publicKey.toString(), 8)
        ) : (
          "Connect Wallet"
        )}
      </Button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 right-0 mt-2 w-48 rounded-md bg-card shadow-lg border border-border"
          >
            <div className="p-3 border-b border-border">
              <div className="text-sm font-medium">Connected Wallet</div>
              <div className="text-xs text-muted-foreground break-all mt-1">
                {publicKey?.toString()}
              </div>
            </div>
            <div className="p-1">
              <button
                className="w-full text-left rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                onClick={handleDisconnect}
              >
                Disconnect
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletButton;