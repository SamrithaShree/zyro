import { Home, Activity, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around max-w-md mx-auto px-6 py-4">
        <button
          onClick={() => navigate("/dashboard")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive("/dashboard")
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs">Home</span>
        </button>
        <button
          onClick={() => navigate("/activity")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive("/activity")
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Activity className="w-6 h-6" />
          <span className="text-xs">Activity</span>
        </button>
        <button
          onClick={() => navigate("/profile")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive("/profile")
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </nav>
  );
}
