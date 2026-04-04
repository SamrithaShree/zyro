import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ModalSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const ModalSheet: React.FC<ModalSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1B4965]/40 backdrop-blur-sm z-[60]"
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-full sm:max-w-[640px] lg:max-w-[900px] bg-[#F4FBFB] rounded-t-[32px] shadow-[0_-12px_40px_rgba(0,0,0,0.15)] z-[70] overflow-hidden"
          >
            {/* Handle */}
            <div className="w-full flex justify-center py-3">
              <div className="w-12 h-1.5 bg-[#1B4965]/10 rounded-full" />
            </div>
            
            <div className="px-4 sm:px-6 lg:px-8 pb-10 pt-2">
              {title && (
                <h2 className="text-[20px] font-bold text-[#1B4965] mb-6 tracking-tight">
                  {title}
                </h2>
              )}
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
