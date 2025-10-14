import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StepWrapperProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  onNext: () => void;
  onBack?: () => void;
  showBack?: boolean;
}

const StepWrapper = ({ title, icon, children, onNext, onBack, showBack = true }: StepWrapperProps) => {
  return (
    <Card className="p-8 hover-lift">
      <div className="flex items-center gap-4 mb-6">
        <div className="text-4xl">{icon}</div>
        <h2 className="text-3xl font-bold">{title}</h2>
      </div>

      <div className="space-y-6 mb-8">{children}</div>

      <div className="flex gap-4">
        {showBack && onBack && (
          <Button variant="secondary" onClick={onBack} className="flex-1">
            Back
          </Button>
        )}
        <Button onClick={onNext} className="flex-1">
          Next
        </Button>
      </div>
    </Card>
  );
};

export default StepWrapper;
