import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Copy, ExternalLink, Power, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

const WalletButton = () => {
  const { connected, connecting, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showDropdown && !(e.target as Element).closest('.wallet-dropdown')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown]);

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

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="relative wallet-dropdown">
      <Button
        variant={connected ? "outline" : "premium"}
        size="sm"
        className="min-w-[140px]"
        onClick={handleConnect}
        disabled={connecting}
      >
        <Wallet className="h-4 w-4 mr-2" />
        {connecting ? (
          <>
            <div className="h-2 w-2 bg-current rounded-full animate-pulse mr-2" />
            Connecting...
          </>
        ) : connected && publicKey ? (
          <span className="font-mono">{truncateAddress(publicKey.toString())}</span>
        ) : (
          "Connect Wallet"
        )}
      </Button>

      <AnimatePresence>
        {showDropdown && connected && publicKey && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 rounded-lg bg-card shadow-xl border border-border overflow-hidden z-50"
          >
            {/* Wallet Header */}
            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Phantom Wallet</span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-600 font-medium">
                  Connected
                </span>
              </div>
              
              {/* Address Display */}
              <div className="bg-background/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-sm truncate flex-1">
                    {publicKey.toString()}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={copyAddress}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Wallet Stats */}
            <div className="p-4 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Balance</p>
                <p className="font-semibold">52.37 SOL</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">USD Value</p>
                <p className="font-semibold">$3,247.94</p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 pt-0 space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                leftIcon={<ExternalLink className="h-4 w-4" />}
                onClick={() => window.open(`https://explorer.solana.com/address/${publicKey.toString()}`, '_blank')}
              >
                View on Explorer
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10"
                leftIcon={<Power className="h-4 w-4" />}
                onClick={handleDisconnect}
              >
                Disconnect Wallet
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletButton;