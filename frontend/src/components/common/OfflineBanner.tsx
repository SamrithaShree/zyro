import { motion, AnimatePresence } from "motion/react";
import { WifiOff } from "lucide-react";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-[#FF6B35] text-white text-sm font-medium shadow-lg"
          role="alert"
          aria-live="polite"
        >
          <WifiOff className="w-4 h-4 flex-shrink-0" />
          <span>
            You are offline. We'll sync your verification once you're back
            online.
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
