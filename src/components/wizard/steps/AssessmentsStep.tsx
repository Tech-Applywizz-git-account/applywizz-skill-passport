import { Trophy } from "lucide-react";
import StepWrapper from "../StepWrapper";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AssessmentsStepProps {
  onNext: () => void;
  onBack: () => void;
  updateFormData: (data: any) => void;
}

const AssessmentsStep = ({ onNext, onBack, updateFormData }: AssessmentsStepProps) => {
  const sampleAssessments = [
    { name: "JavaScript Advanced", badge: "Gold", score: "95/100", rank: "Top 5%" },
    { name: "React Performance", badge: "Platinum", score: "98/100", rank: "Top 2%" },
    { name: "System Design", badge: "Silver", score: "87/100", rank: "Top 15%" },
  ];

  const handleSubmit = () => {
    updateFormData({ assessments: sampleAssessments });
    onNext();
  };

  return (
    <StepWrapper title="Assessments & Badges" icon={<Trophy />} onNext={handleSubmit} onBack={onBack}>
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Your assessment scores and badges from various platforms
        </p>

        {sampleAssessments.map((assessment, index) => (
          <Card key={index} className="p-6 hover-lift">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{assessment.name}</h3>
                  <p className="text-sm text-muted-foreground">Score: {assessment.score}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  variant={assessment.badge === "Platinum" ? "default" : "secondary"}
                  className="mb-1"
                >
                  {assessment.badge}
                </Badge>
                <p className="text-xs text-muted-foreground">{assessment.rank}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </StepWrapper>
  );
};

export default AssessmentsStep;
