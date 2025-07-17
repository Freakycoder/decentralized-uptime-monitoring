// src/pages/_app.tsx
import { useState, useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '../contexts/AuthContext';
import JupiterWalletProvider from '../components/wallet/JupiterWalletProvider';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);

  // After mounting, we can safely use client-side APIs
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthProvider>
        <JupiterWalletProvider>
            <Head>
              <title>Digital Data Contribution Network</title>
              <meta name="description" content="Contribute digital data and earn rewards on Solana" />
              <link rel="icon" href="/favicon.ico" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>
            
            <div suppressHydrationWarning>
              {!mounted ? (
                // Show a basic loading state that won't cause hydration issues
                <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
                  <div className="text-center">Loading...</div>
                </div>
              ) : (
                <Component {...pageProps} />
              )}
            </div>
        </JupiterWalletProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default MyApp;