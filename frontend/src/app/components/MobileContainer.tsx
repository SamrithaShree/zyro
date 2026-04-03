import { ReactNode, CSSProperties } from "react";

interface MobileContainerProps {
  children: ReactNode;
  hasBottomNav?: boolean;
  style?: CSSProperties;
}

export function MobileContainer({
  children,
  hasBottomNav = false,
  style,
}: MobileContainerProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)", ...style }}>
      <div className="max-w-md mx-auto relative min-h-screen">
        <div className={hasBottomNav ? "pb-20" : ""}>{children}</div>
      </div>
    </div>
  );
}
