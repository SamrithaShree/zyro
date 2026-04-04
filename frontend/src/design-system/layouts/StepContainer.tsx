import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProgressBar } from '../components/ProgressBar';
import '../styles/atmosphere.css';

interface StepContainerProps {
  children: ReactNode;
  step: number;
  totalSteps: number;
  onBack?: () => void;
  title?: string;
  subtext?: string;
}

export const StepContainer: React.FC<StepContainerProps> = ({
  children,
  step,
  totalSteps,
  onBack,
  title,
  subtext,
}) => {
  return (
    <div className="zyro-root font-sans">
      <div className="zyro-atmosphere" />
      
      <div className="zyro-container">
        {/* Header Section */}
        <header className="px-4 sm:px-6 lg:px-8 pt-6 pb-2 z-10">
          <div className="flex items-center justify-between mb-4 h-10">
            {onBack ? (
              <button 
                onClick={onBack}
                className="w-10 h-10 flex items-center justify-start text-[#1B4965] active:opacity-60 transition-opacity"
              >
                {/* Simple Back Icon Placeholder */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
            ) : <div className="w-10" />}
            
            <div className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#1B4965]/60">
              Step {step} of {totalSteps}
            </div>
            
            <div className="w-10" />
          </div>
          <ProgressBar current={step} total={totalSteps} />
        </header>

        {/* Scrollable Viewport */}
        <main className="independent-scroll px-4 sm:px-6 lg:px-8 pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {(title || subtext) && (
                <div className="mb-8">
                  {title && <h1 className="text-[26px] font-bold text-[#1B4965] leading-tight mb-2 tracking-[-0.02em]">{title}</h1>}
                  {subtext && <p className="text-[16px] text-[#1B4965]/70 font-normal leading-relaxed">{subtext}</p>}
                </div>
              )}
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
