import { MobileContainer } from "../components/MobileContainer";
import { BottomNav } from "../components/BottomNav";
import {
  User,
  MapPin,
  Wallet,
  Shield,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../../store/useAuthStore";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { apiService } from "../../services/api";

export function Profile() {
  const navigate = useNavigate();
  const { phone, logout: authLogout } = useAuthStore();
  const { data, reset: onboardingReset } = useOnboardingStore();

  const handleLogout = async () => {
    try {
      await apiService.auth.logout();
    } catch {
      // Ignore logout errors
    } finally {
      authLogout();
      onboardingReset();
      navigate("/login");
    }
  };

  return (
    <MobileContainer hasBottomNav>
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-6">Profile</h1>

          {/* User Info */}
          <div className="bg-gradient-to-br from-card to-secondary border border-border rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8 text-background" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Delivery Rider</h2>
                <p className="text-sm text-muted-foreground">{phone || "+91 98765 43210"}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <span className="text-sm text-muted-foreground">Trust Score</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full w-[95%] bg-gradient-to-r from-accent to-primary" />
                </div>
                <span className="font-bold text-primary">95</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Work Details */}
          <div>
            <h3 className="text-xs text-muted-foreground mb-3 px-2">
              WORK DETAILS
            </h3>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <button className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-accent" />
                  <div className="text-left">
                    <div className="font-medium">Work Location</div>
                    <div className="text-sm text-muted-foreground">
                      {data.zone || "Anna Nagar"}, {data.city || "Chennai"}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
              <div className="h-px bg-border" />
              <button className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <div className="font-medium">Platforms</div>
                    <div className="text-sm text-muted-foreground">
                      {data.platform || "Swiggy, Zomato"}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Payment */}
          <div>
            <h3 className="text-xs text-muted-foreground mb-3 px-2">PAYMENT</h3>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <button className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-[#00FF87]" />
                  <div className="text-left">
                    <div className="font-medium">UPI ID</div>
                    <div className="text-sm text-muted-foreground">
                      {data.upiId || "rider@paytm"}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xs text-muted-foreground mb-3 px-2">ACCOUNT</h3>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <button className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-accent" />
                  <div className="text-left">
                    <div className="font-medium">Account Settings</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
              <div className="h-px bg-border" />
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors text-destructive"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Log Out</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">Zyro v1.0.0</p>
          <p className="text-xs text-muted-foreground mt-1">
            Income protection for delivery workers
          </p>
        </div>
      </div>

      <BottomNav />
    </MobileContainer>
  );
}
