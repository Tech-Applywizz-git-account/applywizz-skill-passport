import { Code2 } from "lucide-react";
import StepWrapper from "../StepWrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TechnicalProfilesStepProps {
  onNext: () => void;
  onBack: () => void;
  updateFormData: (data: any) => void;
}

const TechnicalProfilesStep = ({ onNext, onBack, updateFormData }: TechnicalProfilesStepProps) => {
  const popularSkills = ["React", "Python", "JavaScript", "TypeScript", "Node.js", "AWS", "Docker", "Kubernetes"];

  const handleSubmit = () => {
    updateFormData({ technicalProfiles: {} });
    onNext();
  };

  return (
    <StepWrapper title="Technical Profiles & Skills" icon={<Code2 />} onNext={handleSubmit} onBack={onBack}>
      <div className="space-y-6">
        <div className="border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Technical Profiles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>GitHub Profile</Label>
              <Input placeholder="https://github.com/username" />
            </div>

            <div>
              <Label>LeetCode / HackerRank</Label>
              <Input placeholder="https://leetcode.com/username" />
            </div>

            <div>
              <Label>Kaggle / Behance / Dribbble</Label>
              <Input placeholder="https://kaggle.com/username" />
            </div>

            <div>
              <Label>Portfolio Website</Label>
              <Input placeholder="https://yourportfolio.com" />
            </div>
          </div>
        </div>

        <div className="border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Skills & Proficiency</h3>
          
          <div className="mb-4">
            <Label>Quick Add Skills</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {popularSkills.map((skill) => (
                <Badge key={skill} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Add Custom Skill</Label>
              <Input placeholder="Enter skill name" />
            </div>

            <div>
              <Label>Proficiency Level</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </StepWrapper>
  );
};

export default TechnicalProfilesStep;
