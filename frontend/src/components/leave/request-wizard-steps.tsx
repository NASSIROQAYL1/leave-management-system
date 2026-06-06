import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

interface RequestWizardStepsProps {
  currentStep: number;
  steps: string[];
}

export function RequestWizardSteps({ currentStep, steps }: RequestWizardStepsProps) {
  return (
    <div className="rounded-3xl border border-border bg-card px-5 py-4">
      <div className="flex items-center justify-between gap-3 overflow-x-auto">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const completed = stepNumber < currentStep;
          const active = stepNumber === currentStep;

          return (
            <div key={step} className="flex min-w-0 flex-1 items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition",
                  completed
                    ? "border-success bg-success text-white"
                    : active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground",
                )}
              >
                {completed ? <Check className="h-4 w-4" /> : stepNumber}
              </div>
              <div className="min-w-0">
                <p className={cn("text-sm font-medium", active || completed ? "text-foreground" : "text-muted-foreground")}>
                  {step}
                </p>
              </div>
              {index < steps.length - 1 ? (
                <div className={cn("hidden h-px flex-1 md:block", completed ? "bg-success/50" : "bg-border")} />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
