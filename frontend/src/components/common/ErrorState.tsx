import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "../../app/components/ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export function ErrorState({
  message = "Something went wrong. Please try again.",
  onRetry,
  fullScreen = false,
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 text-center px-6 ${
        fullScreen ? "min-h-screen" : "py-12"
      }`}
    >
      <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <div>
        <h3 className="font-semibold mb-1">Oops!</h3>
        <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
      </div>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="gap-2"
          aria-label="Retry"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </Button>
      )}
    </div>
  );
}
