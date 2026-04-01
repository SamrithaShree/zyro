import { ReactNode } from "react";

interface MobileContainerProps {
  children: ReactNode;
  hasBottomNav?: boolean;
}

export function MobileContainer({
  children,
  hasBottomNav = false,
}: MobileContainerProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto relative">
        <div className={hasBottomNav ? "pb-24" : ""}>{children}</div>
      </div>
    </div>
  );
}
