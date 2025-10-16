import { useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BreakdownItem {
  label: string;
  score: number;
  maxScore: number;
  color: string;
}

interface MatchBreakdownProps {
  breakdown: BreakdownItem[];
}

export const MatchBreakdown = ({ breakdown }: MatchBreakdownProps) => {
  const [showExplainer, setShowExplainer] = useState(false);

  return (
    <div className="bg-card rounded-xl border border-border shadow-elegant p-6 space-y-4 animate-fade-up" style={{ animationDelay: "40ms" }}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground tracking-tighter">
          Match Breakdown
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-xs text-secondary hover:text-foreground"
          onClick={() => setShowExplainer(!showExplainer)}
        >
          <Info className="h-4 w-4" />
          Why this score?
        </Button>
      </div>

      {showExplainer && (
        <div className="p-3 bg-info border border-info rounded-lg text-xs text-info-foreground space-y-1 animate-scale-in">
          <p className="font-medium">How we calculate the match score:</p>
          <ul className="list-disc list-inside space-y-1 text-secondary">
            <li>Must-have skills are weighted highest</li>
            <li>Nice-to-have skills provide bonus points</li>
            <li>Experience and projects demonstrate capability</li>
            <li>Assessments validate technical proficiency</li>
            <li>Verification adds trust bonus</li>
          </ul>
        </div>
      )}

      <div className="space-y-3">
        {breakdown.map((item, idx) => (
          <div
            key={item.label}
            className="group animate-fade-up"
            style={{ animationDelay: `${(idx + 1) * 40}ms` }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-secondary">{item.label}</span>
              <span className="text-sm font-medium text-foreground">
                {item.score}/{item.maxScore}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${item.color}`}
                style={{
                  width: `${(item.score / item.maxScore) * 100}%`,
                  animationDelay: `${(idx + 1) * 100}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
