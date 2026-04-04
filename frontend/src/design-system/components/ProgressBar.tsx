import React from 'react';
import { motion } from 'motion/react';
import { colors } from '../tokens';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const progress = (current / total) * 100;

  return (
    <div className="w-full h-1 bg-white/20 overflow-hidden relative">
      <motion.div
        className="h-full bg-accent"
        style={{ backgroundColor: colors.accent }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.6, ease: "circOut" }}
      />
    </div>
  );
};
