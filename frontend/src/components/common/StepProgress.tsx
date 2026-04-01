import { motion } from "motion/react";

interface Step {
  id: number;
  label: string;
  sublabel?: string;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number; // 1-based index
  variant?: "linear" | "dots";
}

export function StepProgress({
  steps,
  currentStep,
  variant = "dots",
}: StepProgressProps) {
  if (variant === "linear") {
    const percent = ((currentStep - 1) / (steps.length - 1)) * 100;
    return (
      <div className="w-full" role="progressbar" aria-valuenow={currentStep} aria-valuemax={steps.length}>
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>{steps[currentStep - 1]?.label}</span>
          <span>{currentStep}/{steps.length}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent to-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2" role="progressbar">
      {steps.map((step) => {
        const isCompleted = step.id < currentStep;
        const isCurrent = step.id === currentStep;
        return (
          <div
            key={step.id}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              isCompleted
                ? "bg-primary flex-1"
                : isCurrent
                ? "bg-accent flex-1"
                : "bg-muted flex-[0.5]"
            }`}
          />
        );
      })}
    </div>
  );
}
