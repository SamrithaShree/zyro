import React, { Suspense, useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { OfflineBanner } from "../components/common/OfflineBanner";
import { ThemeProvider } from "next-themes";
import { useAuthStore } from "../store/useAuthStore";
import { useOnboardingStore } from "../store/useOnboardingStore";

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
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-background text-foreground">
          <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Zyro hit an unexpected error. Please refresh to continue.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold"
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
  const { isAuthenticated, token } = useAuthStore();
  const syncWithBackend = useOnboardingStore((s) => s.syncWithBackend);

  useEffect(() => {
    if (isAuthenticated && token) {
      syncWithBackend();
    }
  }, [isAuthenticated, token, syncWithBackend]);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="dark">
        <ErrorBoundary>
          {/* OfflineBanner lives outside router — it only needs network status */}
          <OfflineBanner />
          {/* RouterProvider renders everything inside router context */}
          <Suspense fallback={null}>
            <RouterProvider router={router} />
          </Suspense>
          <Toaster richColors position="top-center" />
        </ErrorBoundary>
      </div>
    </ThemeProvider>
  );
}
