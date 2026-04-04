import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuthStore } from "../../store/useAuthStore";
import { useOnboardingStore } from "../../store/useOnboardingStore";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const { otpVerified, isRegistered, hasMpin, onboardingComplete } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Avoid hydration mismatch on initial render

  const currentPath = location.pathname;

  // 1. Not verified at all -> must be on /login (or /)
  if (!otpVerified) {
    if (currentPath !== "/login" && currentPath !== "/") {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  }

  // 2. Verified, but not registered -> must go to /onboarding
  if (otpVerified && !isRegistered) {
    if (currentPath !== "/onboarding") {
      return <Navigate to="/onboarding" replace />;
    }
    return <>{children}</>;
  }

  // 3. Registered, but no mPIN -> must go to /mpin-setup
  if (isRegistered && !hasMpin) {
    if (currentPath !== "/mpin-setup") {
      return <Navigate to="/mpin-setup" replace />;
    }
    return <>{children}</>;
  }

  // 4. Has mPIN, but onboarding not complete -> must go to /onboarding
  if (hasMpin && !onboardingComplete) {
    if (currentPath !== "/onboarding" && currentPath !== "/mpin-login") {
      // If they are on mpin-login to verify, let them. Otherwise onboarding.
      // Wait, if they have an mPIN, they might need to log in first.
      // Actually, if onboarding is not complete, they should complete it.
      // Let's force them to onboarding.
      return <Navigate to="/onboarding" replace />;
    }
    return <>{children}</>;
  }

  // 5. Fully complete -> must go to /dashboard
  // Note: if they are fully complete but haven't logged in this session (e.g. token expired),
  // they need to hit /mpin-login.
  // Wait, if `hasMpin` is true, does it mean they are logged in *right now*?
  // The state machine says:
  // IF existing user: OTP -> mPIN login -> dashboard
  // So after OTP, `hasMpin` is true. They go to /mpin-login.
  // After /mpin-login, they go to /dashboard.
  // But wait, what distinguishes being ON /mpin-login vs /dashboard?
  // We need a way to know if they have "unlocked" the app with their mPIN.
  // The `token` might be present, but maybe they still need to unlock?
  // Let's add a condition: if they are on /mpin-login, let them render.
  
  if (currentPath === "/mpin-login") {
     return <>{children}</>;
  }

  // If fully complete and trying to access login/onboarding, redirect to dashboard
  if (currentPath === "/login" || currentPath === "/" || currentPath === "/onboarding" || currentPath === "/mpin-setup") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
