import React from 'react';
import { motion } from 'motion/react';

interface StickyCTAProps {
  children: React.ReactNode;
  className?: string;
}

export const StickyCTA: React.FC<StickyCTAProps> = ({ children, className = '' }) => {
  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`
        fixed bottom-0 left-1/2 -translate-x-1/2 
        w-full max-w-full sm:max-w-[640px] lg:max-w-[900px]
        bg-[#F4FBFB] px-4 sm:px-6 lg:px-8 pt-5 pb-8
        rounded-t-[24px] shadow-[0_-8px_20px_rgba(27,73,101,0.06)]
        z-50 flex flex-col gap-3
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};
