import React, { Suspense, useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { OfflineBanner } from "../components/common/OfflineBanner";
import { ThemeProvider } from "next-themes";
import { useAuthStore } from "../store/useAuthStore";
import { useOnboardingStore } from "../store/useOnboardingStore";
import { AnimatePresence } from "motion/react";

// ErrorBoundary — class component required by React
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-[#A7D6D3] text-[#1B4965]">
          <div className="w-20 h-20 bg-white/20 rounded-[32px] flex items-center justify-center mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-black mb-2">Something went wrong</h2>
          <p className="text-sm text-[#1B4965]/60 mb-8 font-medium">
            Zyro hit an unexpected error. Please refresh to continue.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-[#62B6CB] text-white rounded-2xl font-black shadow-xl shadow-[#62B6CB]/20"
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { otpVerified, token } = useAuthStore();
  const syncWithBackend = useOnboardingStore((s) => s.syncWithBackend);

  useEffect(() => {
    if (otpVerified && token) {
      syncWithBackend();
    }
  }, [otpVerified, token, syncWithBackend]);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <div className="bg-[#A7D6D3] min-h-screen">
        <ErrorBoundary>
          <OfflineBanner />
          <AnimatePresence mode="wait">
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#1B4965] font-bold">Loading Zyro...</div>}>
              <RouterProvider router={router} />
            </Suspense>
          </AnimatePresence>
          <Toaster richColors position="top-center" expand={false} />
        </ErrorBoundary>
      </div>
    </ThemeProvider>
  );
}
