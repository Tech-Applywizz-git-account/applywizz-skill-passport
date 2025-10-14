// src/components/wizard/steps/StepWrapper.tsx (or wherever it is)
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export interface StepWrapperProps {
  title: string;
  icon?: ReactNode;
  onNext: () => void | Promise<void>;
  onBack: () => void;
  children: ReactNode;

  // NEW (optional)
  nextLabel?: string;       // e.g., "Saving...", "Next", "Review"
  nextDisabled?: boolean;   // disable Next while saving
  backLabel?: string;       // optional custom back label
}

const StepWrapper = ({
  title,
  icon,
  onNext,
  onBack,
  children,
  nextLabel = "Next",
  nextDisabled = false,
  backLabel = "Back",
}: StepWrapperProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>

      {children}

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onBack}>
          {backLabel}
        </Button>
        <Button type="button" onClick={onNext} disabled={nextDisabled}>
          {nextLabel}
        </Button>
      </div>
    </div>
  );
};

export default StepWrapper;
