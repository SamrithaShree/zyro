import React, { useState } from 'react';
import { motion } from 'motion/react';

interface SliderInputProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  unit?: string;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  label,
  unit = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full space-y-6">
      {(label || unit) && (
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#1B4965]/60">{label}</span>
          <span className="text-[24px] font-extrabold text-[#1B4965] tracking-tight">
            {value}{unit}
          </span>
        </div>
      )}
      
      <div className="relative h-10 flex items-center group">
        {/* Track Background */}
        <div className="absolute w-full h-2 bg-white/50 rounded-full overflow-hidden">
          {/* Filled Track */}
          <motion.div 
            className="h-full bg-[#62B6CB]"
            animate={{ width: `${percentage}%` }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          />
        </div>
        
        {/* Hidden Native Input for accessibility/logic */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        {/* Custom Thumb */}
        <motion.div
          className="absolute w-8 h-8 rounded-full bg-[#1B4965] border-4 border-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] pointer-events-none flex items-center justify-center"
          animate={{ 
            left: `calc(${percentage}% - 16px)`,
            scale: isDragging ? 1.15 : 1
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
           <div className="w-1 h-3 bg-white/30 rounded-full" />
        </motion.div>
      </div>
    </div>
  );
};
