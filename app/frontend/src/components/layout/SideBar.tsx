import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { contributionMethods } from '../../lib/mockData';
import { useTheme } from '../../components/ui/theme-provider';
import { cn, getContributionIcon } from '../../lib/utils';
import { sidebarAnimation, sidebarItemAnimation, fadeIn } from '../../lib/framer-variants';


const Sidebar = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // After mounting, we can safely access window
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMobile = () => {
    setMobileOpen(!mobileOpen);
  };

  // Sidebar link utility - adds active state
  const isActive = (path: string) => {
    return router.pathname === path;
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [router.pathname]);

  // Only render on client-side to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Mobile menu toggle */}
      <button
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-50 md:hidden flex items-center justify-center w-10 h-10 rounded-md bg-secondary text-foreground border border-border shadow-md"
        aria-label="Toggle menu"
      >
        <span className="text-xl">☰</span>
      </button>

      {/* Overlay to close sidebar when clicking outside */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        variants={sidebarAnimation}
        initial="closed"
        animate={mobileOpen ? "open" : "closed"}
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-card border-r border-border shadow-lg z-40 flex flex-col",
          "md:translate-x-0 transform transition-transform duration-300 ease-in-out"
        )}
      >
        {/* Logo */}
        <div className="p-4 flex items-center gap-2 border-b border-border mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            D
          </div>
          <div className="font-bold text-xl">DataContrib</div>
        </div>

        {/* Main Navigation */}
        <div className="px-4 mb-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Dashboard
          </div>
          <nav>
            <Link href="/" passHref>
              <motion.a
                variants={sidebarItemAnimation}
                whileHover={{ x: 4 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-md mb-1 font-medium transition-colors",
                  isActive('/') 
                    ? "bg-primary/10 text-primary" 
                    : "text-foreground hover:bg-accent"
                )}
              >
                <span className="text-lg">🏠</span>
                <span>Home</span>
              </motion.a>
            </Link>
          </nav>
        </div>

        {/* Contribution Methods */}
        <div className="px-4 mb-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Contribution Methods
          </div>
          <nav className="space-y-1">
            {contributionMethods.map((method) => (
              <Link key={method.id} href={`/contribution/${method.id}`} passHref>
                <motion.a
                  variants={sidebarItemAnimation}
                  whileHover={{ x: 4 }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-md font-medium transition-colors",
                    isActive(`/contribution/${method.id}`)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  <span className="text-lg">{getContributionIcon(method.icon)}</span>
                  <span>{method.name}</span>
                </motion.a>
              </Link>
            ))}
          </nav>
        </div>

        {/* Account */}
        <div className="px-4 mb-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Account
          </div>
          <nav className="space-y-1">
            <Link href="/settings" passHref>
              <motion.a
                variants={sidebarItemAnimation}
                whileHover={{ x: 4 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-md font-medium transition-colors",
                  isActive('/settings')
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-accent"
                )}
              >
                <span className="text-lg">⚙️</span>
                <span>Settings</span>
              </motion.a>
            </Link>
            <Link href="/help" passHref>
              <motion.a
                variants={sidebarItemAnimation}
                whileHover={{ x: 4 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-md font-medium transition-colors",
                  isActive('/help')
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-accent"
                )}
              >
                <span className="text-lg">❓</span>
                <span>Help & Support</span>
              </motion.a>
            </Link>
          </nav>
        </div>

        {/* User profile at bottom */}
        <div className="mt-auto p-4 border-t border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <span className="text-lg">👤</span>
          </div>
          <div>
            <div className="font-medium text-sm">
              John Doe
            </div>
            <div className="text-xs text-muted-foreground">
              52.37 SOL earned
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;