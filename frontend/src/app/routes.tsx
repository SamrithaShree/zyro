import { createBrowserRouter, Navigate } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import { useOnboardingStore } from "../store/useOnboardingStore";

// Screens
import { Welcome } from "./screens/Welcome";
import { PhoneLogin } from "./screens/PhoneLogin";
import { Dashboard } from "./screens/Dashboard";
import { Profile } from "./screens/Profile";
import { OnboardingFlow } from "../features/onboarding/OnboardingFlow";

// Route Guards
function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const isRegistered = useAuthStore((s) => s.isRegistered);
  const isComplete = useOnboardingStore((s) => s.isComplete);
  
  if (!isRegistered || !isComplete) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

export const router = createBrowserRouter([
  // Public
  { path: "/", Component: Welcome },
  { path: "/login", Component: PhoneLogin },

  // Onboarding (requires auth)
  {
    path: "/onboarding",
    element: <AuthGuard><OnboardingFlow /></AuthGuard>,
  },

  // Main app (requires auth + onboarding complete)
  {
    path: "/dashboard",
    element: <AuthGuard><OnboardingGuard><Dashboard /></OnboardingGuard></AuthGuard>,
  },
  {
    path: "/profile",
    element: <AuthGuard><OnboardingGuard><Profile /></OnboardingGuard></AuthGuard>,
  },

  // Fallback
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
