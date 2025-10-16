import { Mail, Phone, Award, MapPin, Clock, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MatchRing } from "./MatchRing";

interface CandidateSummaryCardProps {
  candidate: any;
}

export const CandidateSummaryCard = ({ candidate }: CandidateSummaryCardProps) => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-elegant p-6 space-y-6 animate-fade-up">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center text-center space-y-3">
        <Avatar className="h-20 w-20 border-2 border-border">
          <AvatarImage src={candidate.avatar} alt={candidate.name} />
          <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
            {candidate.name.split(" ").map((n: string) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tighter">
            {candidate.name}
          </h1>
          <p className="text-sm text-secondary mt-1">
            {candidate.role} @ {candidate.company}
          </p>
          <div className="flex items-center justify-center gap-1 text-xs text-secondary mt-1">
            <MapPin className="h-3 w-3" />
            {candidate.location}
          </div>
        </div>
      </div>

      {/* Match Ring */}
      <div className="flex justify-center">
        <MatchRing score={candidate.matchScore} />
      </div>

      {/* Badge Level */}
      <div className="flex justify-center">
        <Badge className="gap-2 px-3 py-1 bg-warning text-warning-foreground font-semibold">
          <Award className="h-4 w-4" />
          {candidate.badgeLevel}
        </Badge>
      </div>

      {/* Key Info Grid */}
      <div className="grid grid-cols-1 gap-3 text-sm">
        <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
          <span className="text-secondary flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Availability
          </span>
          <span className="font-medium text-foreground">{candidate.availability} days</span>
        </div>
        
        <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
          <span className="text-secondary flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Expected Salary
          </span>
          <span className="font-medium text-foreground">{candidate.expectedSalary}</span>
        </div>
        
        <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
          <span className="text-secondary flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Notice Period
          </span>
          <span className="font-medium text-foreground">{candidate.noticePeriod} days</span>
        </div>
      </div>

      {/* Trust Band */}
      <div className="p-3 bg-success/20 border border-success rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-success-foreground font-medium">✅ Admin Verified</span>
        </div>
      </div>

      {/* Quick Tags */}
      <div>
        <p className="text-xs text-secondary mb-2 font-medium">Key Signals</p>
        <div className="flex flex-wrap gap-2">
          {candidate.quickTags.map((tag: any, idx: number) => (
            <Badge
              key={idx}
              variant="outline"
              className={`text-xs ${
                tag.type === "positive"
                  ? "border-success text-success-foreground bg-success/10"
                  : "border-error text-error-foreground bg-error/10"
              }`}
            >
              {tag.type === "positive" ? "+" : "–"}{tag.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Contact Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="gap-2 hover:bg-info/10 border-info/30">
          <Mail className="h-4 w-4" />
          Email
        </Button>
        <Button variant="outline" className="gap-2 hover:bg-info/10 border-info/30">
          <Phone className="h-4 w-4" />
          Call
        </Button>
      </div>

      {/* CTA Stack */}
      <div className="space-y-2 pt-2">
        <Button className="w-full bg-primary hover:bg-primary-hover text-primary-foreground">
          Shortlist Candidate
        </Button>
        <Button variant="outline" className="w-full border-error text-error hover:bg-error/10">
          Reject
        </Button>
        <Button variant="outline" className="w-full gap-2">
          <Calendar className="h-4 w-4" />
          Schedule Interview
        </Button>
      </div>
    </div>
  );
};
