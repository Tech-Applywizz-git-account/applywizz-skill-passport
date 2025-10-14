import { Eye, ThumbsUp, ThumbsDown, MessageSquare, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ScoreRing from "./ScoreRing";
import { Candidate } from "@/data/mockData";

interface CandidateRowProps {
  candidate: Candidate;
  matchScore: number;
  onQuickView: () => void;
  onShortlist: () => void;
  onReject: () => void;
}

const CandidateRow = ({
  candidate,
  matchScore,
  onQuickView,
  onShortlist,
  onReject,
}: CandidateRowProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getBadgeColor = (level: string | null) => {
    switch (level) {
      case "Platinum":
        return "bg-primary text-primary-foreground";
      case "Gold":
        return "bg-warning text-warning-foreground";
      case "Silver":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-6">
        {/* Avatar + Basic Info */}
        <div className="flex items-start gap-4 flex-1">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(candidate.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-lg text-foreground">
                {candidate.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {candidate.role} · {candidate.company}
              </p>
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              {candidate.verified && (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  ✅ Verified
                </Badge>
              )}
              {candidate.badgeLevel && (
                <Badge className={getBadgeColor(candidate.badgeLevel)}>
                  {candidate.badgeLevel}
                </Badge>
              )}
              {candidate.assessments.slice(0, 2).map((assessment) => (
                <Badge key={assessment.name} variant="outline">
                  {assessment.name}: {assessment.score}
                </Badge>
              ))}
            </div>

            {/* Highlights */}
            <div className="text-sm text-muted-foreground">
              {candidate.experienceYears} yrs · {candidate.skills.slice(0, 3).join(", ")} ·{" "}
              {candidate.location} · {candidate.availabilityDays}-day notice
            </div>
          </div>
        </div>

        {/* Match Score */}
        <div className="flex flex-col items-center gap-4">
          <ScoreRing score={matchScore} size={80} strokeWidth={8} />
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onQuickView}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              View
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onShortlist}
              className="gap-2 hover:bg-success/10 hover:text-success hover:border-success"
            >
              <ThumbsUp className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onReject}
              className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
            >
              <ThumbsDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateRow;
