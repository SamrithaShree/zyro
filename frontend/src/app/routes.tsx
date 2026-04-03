import { createBrowserRouter, Navigate } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import { useOnboardingStore } from "../store/useOnboardingStore";

// Screens
import { SetPIN } from "./screens/SetPIN";
import { LoginWithPIN } from "./screens/LoginWithPIN";
import { RegistrationSummary } from "./screens/RegistrationSummary";
import { RegistrationSuccess } from "./screens/RegistrationSuccess";
import { Welcome } from "./screens/Welcome";
import { PhoneLogin } from "./screens/PhoneLogin";
import { Signup } from "./screens/Signup";
import { OTPVerification } from "./screens/OTPVerification";
import { ActivityConsentScreen } from "./screens/ActivityConsentScreen";
import { PlatformSelection } from "./screens/PlatformSelection";
import { AadhaarVerification } from "./screens/AadhaarVerification";
import { PlatformIdVerification } from "./screens/PlatformIdVerification";
import { SelfieCapture } from "./screens/SelfieCapture";
import { LocationCapture } from "./screens/LocationCapture";
import { WorkProfile } from "./screens/WorkProfile";
import { IncomeInput } from "./screens/IncomeInput";
import { AnalysisLoading } from "./screens/AnalysisLoading";
import { RiskSummary } from "./screens/RiskSummary";
import { UPISetup } from "./screens/UPISetup";
import { ReadinessConfirmation } from "./screens/ReadinessConfirmation";
import { Dashboard } from "./screens/Dashboard";
import { Activity } from "./screens/Activity";
import { Profile } from "./screens/Profile";
import { DisruptionDetected } from "./screens/DisruptionDetected";
import { ValidationInProgress } from "./screens/ValidationInProgress";
import { ClaimProcessing } from "./screens/ClaimProcessing";
import { TimelineView } from "./screens/TimelineView";
import { EligibilityExplanation } from "./screens/EligibilityExplanation";
import { ConfidenceCheck } from "./screens/ConfidenceCheck";
import { PayoutSuccess } from "./screens/PayoutSuccess";
import { SavedVsLost } from "./screens/SavedVsLost";
import { ClaimDetails } from "./screens/ClaimDetails";
import { UnderReview } from "./screens/UnderReview";

// Route Guards
function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s: { isAuthenticated: boolean }) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const step = useOnboardingStore((s: { step: string }) => s.step);
  const stepRoutes: Record<string, string> = {
    CONSENT: "/activity-consent",
    PLATFORM: "/platform-selection",
    AADHAAR: "/aadhaar-verify",
    PLATFORM_ID: "/platform-id-verify",
    SELFIE: "/selfie-capture",
    LOCATION: "/location",
    WORK: "/work-profile",
    INCOME: "/income-input",
    UPI: "/upi-setup",
  };
  if (step !== "DONE") {
    return <Navigate to={stepRoutes[step] || "/activity-consent"} replace />;
  }
  return <>{children}</>;
}

export const router = createBrowserRouter([
  // Public
  { path: "/", Component: Welcome },
  { path: "/login", Component: PhoneLogin },
  { path: "/login-pin", Component: LoginWithPIN },
  { path: "/signup", Component: Signup },
  { path: "/verify-otp", Component: OTPVerification },
  { path: "/set-pin", Component: SetPIN },
  { path: "/registration-summary", Component: RegistrationSummary },
  { path: "/registration-success", Component: RegistrationSuccess },

  // Onboarding (requires auth)
  {
    path: "/activity-consent",
    element: <AuthGuard><ActivityConsentScreen /></AuthGuard>,
  },
  {
    path: "/platform-selection",
    element: <AuthGuard><PlatformSelection /></AuthGuard>,
  },
  {
    path: "/aadhaar-verify",
    element: <AuthGuard><AadhaarVerification /></AuthGuard>,
  },
  {
    path: "/platform-id-verify",
    element: <AuthGuard><PlatformIdVerification /></AuthGuard>,
  },
  {
    path: "/selfie-capture",
    element: <AuthGuard><SelfieCapture /></AuthGuard>,
  },
  {
    path: "/location",
    element: <AuthGuard><LocationCapture /></AuthGuard>,
  },
  {
    path: "/work-profile",
    element: <AuthGuard><WorkProfile /></AuthGuard>,
  },
  {
    path: "/income-input",
    element: <AuthGuard><IncomeInput /></AuthGuard>,
  },
  {
    path: "/analysis-loading",
    element: <AuthGuard><AnalysisLoading /></AuthGuard>,
  },
  {
    path: "/risk-summary",
    element: <AuthGuard><RiskSummary /></AuthGuard>,
  },
  {
    path: "/upi-setup",
    element: <AuthGuard><UPISetup /></AuthGuard>,
  },
  {
    path: "/readiness",
    element: <AuthGuard><ReadinessConfirmation /></AuthGuard>,
  },

  // Main app (requires auth + onboarding complete)
  {
    path: "/dashboard",
    element: <AuthGuard><OnboardingGuard><Dashboard /></OnboardingGuard></AuthGuard>,
  },
  {
    path: "/activity",
    element: <AuthGuard><OnboardingGuard><Activity /></OnboardingGuard></AuthGuard>,
  },
  {
    path: "/profile",
    element: <AuthGuard><OnboardingGuard><Profile /></OnboardingGuard></AuthGuard>,
  },

  // Claim pipeline
  { path: "/disruption-detected", Component: DisruptionDetected },
  { path: "/validation", Component: ValidationInProgress },
  { path: "/claim-processing", Component: ClaimProcessing },
  { path: "/timeline", Component: TimelineView },
  { path: "/eligibility", Component: EligibilityExplanation },
  { path: "/confidence-check", Component: ConfidenceCheck },
  { path: "/under-review", Component: UnderReview },

  // Dynamic claim routes (deep linking)
  { path: "/payout-success/:eventId", Component: PayoutSuccess },
  { path: "/payout-success", Component: PayoutSuccess },
  { path: "/saved-vs-lost", Component: SavedVsLost },
  { path: "/claim-details/:eventId", Component: ClaimDetails },
  { path: "/claim-details", Component: ClaimDetails },

  // Fallback
  { path: "*", element: <Navigate to="/" replace /> },
]);
