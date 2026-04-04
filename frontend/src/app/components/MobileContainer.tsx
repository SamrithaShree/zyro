import { ReactNode, CSSProperties } from "react";

interface MobileContainerProps {
  children: ReactNode;
  hasBottomNav?: boolean;
  style?: CSSProperties;
  className?: string;
}

export function MobileContainer({
  children,
  hasBottomNav = false,
  style,
  className = "",
}: MobileContainerProps) {
  return (
    <div 
      className={`min-h-screen bg-background text-foreground selection:bg-primary/30 ${className}`} 
      style={style}
    >
      <div className="w-full max-w-full sm:max-w-[640px] lg:max-w-[900px] mx-auto relative min-h-screen bg-background shadow-2xl shadow-black/20">
        <div className={hasBottomNav ? "pb-24" : "pb-8"}>
          {children}
        </div>
      </div>
    </div>
  );
}
