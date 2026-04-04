import React from 'react';
import { motion } from 'motion/react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  radius = 12,
  className = '',
}) => {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className={`bg-[#E8F4F4] ${className}`}
      style={{
        width,
        height,
        borderRadius: radius,
      }}
    />
  );
};
