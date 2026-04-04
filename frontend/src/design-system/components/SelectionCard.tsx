import React from 'react';
import { motion } from 'motion/react';

interface SelectionCardProps {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({
  children,
  selected = false,
  onClick,
  className = '',
  icon,
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`
        w-full p-5 rounded-[20px] text-left transition-all duration-200
        flex items-center gap-4 relative overflow-hidden
        border-2
        ${selected 
          ? 'bg-[#62B6CB] border-[#62B6CB] text-white shadow-[0_8px_24px_rgba(98,182,203,0.25)] focus:ring-2 focus:ring-white/50 focus:ring-offset-2' 
          : 'bg-[#F4FBFB] border-transparent text-[#1B4965] shadow-[0_4px_20px_rgba(27,73,101,0.08)] hover:border-[#62B6CB]/20 focus:ring-2 focus:ring-[#62B6CB]'}
        ${className}
      `}
    >
      {icon && (
        <div className={`
          w-12 h-12 rounded-2xl flex items-center justify-center shrink-0
          ${selected ? 'bg-white/20 text-white' : 'bg-[#62B6CB]/10 text-[#62B6CB]'}
        `}>
          {icon}
        </div>
      )}
      <div className="flex-1 font-semibold text-[16px]">
        {children}
      </div>
      
      {selected && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-6 h-6 rounded-full bg-white flex items-center justify-center"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#62B6CB" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        </motion.div>
      )}
    </motion.button>
  );
};
