import { createBrowserRouter, Navigate } from "react-router";

// Components
import { AuthGuard } from "./components/AuthGuard";

// Screens
import { Welcome } from "./screens/Welcome";
import { PhoneLogin } from "./screens/PhoneLogin";
import { MPinLogin } from "./screens/MPinLogin";
import { MPinSetup } from "./screens/MPinSetup";
import { Dashboard } from "./screens/Dashboard";
import { Profile } from "./screens/Profile";
import { Activity } from "./screens/Activity";
import { ClaimDetails } from "./screens/ClaimDetails";
import { OnboardingFlow } from "../features/onboarding/OnboardingFlow";
import { PlanSelection } from "./screens/PlanSelection";
import { SimulationScreen } from "./screens/SimulationScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthGuard><Welcome /></AuthGuard>,
  },
  {
    path: "/login",
    element: <AuthGuard><PhoneLogin /></AuthGuard>,
  },
  {
    path: "/mpin-login",
    element: <AuthGuard><MPinLogin /></AuthGuard>,
  },
  {
    path: "/mpin-setup",
    element: <AuthGuard><MPinSetup /></AuthGuard>,
  },
  {
    path: "/onboarding",
    element: <AuthGuard><OnboardingFlow /></AuthGuard>,
  },
  {
    path: "/plan-selection",
    element: <AuthGuard><PlanSelection /></AuthGuard>,
  },
  {
    path: "/dashboard",
    element: <AuthGuard><Dashboard /></AuthGuard>,
  },
  {
    path: "/activity",
    element: <AuthGuard><Activity /></AuthGuard>,
  },
  {
    path: "/profile",
    element: <AuthGuard><Profile /></AuthGuard>,
  },
  {
    path: "/simulate",
    element: <AuthGuard><SimulationScreen /></AuthGuard>,
  },
  {
    path: "/claim-details/:claimId",
    element: <AuthGuard><ClaimDetails /></AuthGuard>,
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);
