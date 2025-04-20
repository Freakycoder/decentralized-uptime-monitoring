import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from '../components/ui/theme-provider';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider defaultTheme="dark">
      <Head>
        <title>Digital Data Contribution Network</title>
        <meta name="description" content="Contribute digital data and earn rewards on Solana" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;