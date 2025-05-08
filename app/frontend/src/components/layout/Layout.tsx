// src/components/layout/Layout.tsx
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './SideBar';
import Header from './Header';
import { cn } from '../../lib/utils';
import { fadeIn, slideUp } from '../../lib/framer-variants';

interface LayoutProps {
  children: ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-col min-h-screen md:ml-64">
        <Header title={title} />
        <motion.main
          variants={slideUp}
          initial="hidden"
          animate="visible"
          className="flex-1 p-4 md:p-6"
        >
          <motion.div 
            variants={fadeIn}
            className="container mx-auto"
          >
            {children}
          </motion.div>
        </motion.main>
      </div>
    </div>
  );
};

export default Layout;


