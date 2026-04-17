import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, ShieldCheck } from 'lucide-react';

interface StatsStripProps {
  totalSaved: number;
  totalLost: number;
  protectionRatio: number; // 0-100
}

export function StatsStrip({ totalSaved, totalLost, protectionRatio }: StatsStripProps) {
  const fmt = (n: number) => n > 0 ? `₹${n.toLocaleString('en-IN')}` : '₹0';

  const items = [
    {
      label: 'Saved',
      value: fmt(totalSaved),
      icon: <TrendingUp className="w-3.5 h-3.5" />,
      color: '#00FF87',
      ring: 'border-[#00FF87]/20 bg-[#00FF87]/8',
    },
    {
      label: 'Uncovered',
      value: fmt(totalLost),
      icon: <TrendingDown className="w-3.5 h-3.5" />,
      color: '#FF6B35',
      ring: 'border-[#FF6B35]/20 bg-[#FF6B35]/8',
    },
    {
      label: 'Protected',
      value: `${protectionRatio}%`,
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      color: '#62B6CB',
      ring: 'border-[#62B6CB]/20 bg-[#62B6CB]/8',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="grid grid-cols-3 gap-3"
    >
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.07 }}
          className={`${item.ring} border rounded-[18px] p-3.5 space-y-1.5`}
        >
          <div style={{ color: item.color }} className="flex items-center gap-1">
            {item.icon}
            <span className="text-[8px] font-black uppercase tracking-wider leading-none">
              {item.label}
            </span>
          </div>
          <div
            style={{ color: item.color }}
            className="text-[15px] font-black leading-none tracking-tight tabular-nums"
          >
            {item.value}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
