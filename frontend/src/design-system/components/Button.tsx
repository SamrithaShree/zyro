import React from 'react';
import { motion } from 'motion/react';
import { colors } from '../tokens';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
  type = 'button',
}) => {
  const isPrimary = variant === 'primary';

  return (
    <motion.button
      type={type}
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        w-full h-14 rounded-[20px] text-[16px] font-bold transition-colors duration-200
        flex items-center justify-center gap-2 px-6
        ${isPrimary 
          ? 'bg-[#62B6CB] text-white shadow-[0_8px_24px_rgba(98,182,203,0.25)]' 
          : 'bg-white border-2 border-[#62B6CB]/20 text-[#62B6CB]'}
        ${disabled ? 'bg-[#C2DFDE] text-white/80 shadow-none border-none cursor-not-allowed' : 'hover:brightness-105'}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
};
