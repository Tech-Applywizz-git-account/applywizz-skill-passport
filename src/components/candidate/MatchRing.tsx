import { useEffect, useState } from "react";

interface MatchRingProps {
  score: number;
}

export const MatchRing = ({ score }: MatchRingProps) => {
  const [displayScore, setDisplayScore] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const increment = score / 30;
      const interval = setInterval(() => {
        current += increment;
        if (current >= score) {
          setDisplayScore(score);
          clearInterval(interval);
        } else {
          setDisplayScore(Math.floor(current));
        }
      }, 20);
      
      return () => clearInterval(interval);
    }, 200);
    
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = (score: number) => {
    if (score >= 80) return "hsl(var(--success))";
    if (score >= 60) return "hsl(var(--warning))";
    return "hsl(var(--secondary))";
  };

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg className="transform -rotate-90 w-full h-full">
        {/* Background circle */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="hsl(var(--border))"
          strokeWidth="8"
          fill="none"
        />
        {/* Animated progress circle */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke={getColor(score)}
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground tracking-tighter">
          {displayScore}%
        </span>
        <span className="text-xs text-secondary font-medium">Match</span>
      </div>
    </div>
  );
};
