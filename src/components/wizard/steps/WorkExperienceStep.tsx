import { useState } from "react";
import { Building2, Plus, X } from "lucide-react";
import StepWrapper from "../StepWrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface WorkExperienceStepProps {
  onNext: () => void;
  onBack: () => void;
  updateFormData: (data: any) => void;
}

const WorkExperienceStep = ({ onNext, onBack, updateFormData }: WorkExperienceStepProps) => {
  const [experiences, setExperiences] = useState([
    { company: "", role: "", location: "", from: "", to: "", projects: "", documents: null }
  ]);

  const addExperience = () => {
    setExperiences([...experiences, { company: "", role: "", location: "", from: "", to: "", projects: "", documents: null }]);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    updateFormData({ workExperience: experiences });
    onNext();
  };

  return (
    <StepWrapper title="Work Experience" icon={<Building2 />} onNext={handleSubmit} onBack={onBack}>
      <div className="space-y-6">
        {experiences.map((exp, index) => (
          <div key={index} className="border border-border rounded-lg p-6 relative">
            {experiences.length > 1 && (
              <button
                onClick={() => removeExperience(index)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Company Name</Label>
                <Input placeholder="Tech Solutions Ltd." />
              </div>

              <div>
                <Label>Role/Designation</Label>
                <Input placeholder="Senior Software Engineer" />
              </div>

              <div>
                <Label>Location</Label>
                <Input placeholder="San Francisco, CA" />
              </div>

              <div>
                <Label>From</Label>
                <Input type="month" />
              </div>

              <div>
                <Label>To</Label>
                <Input type="month" />
              </div>

              <div className="md:col-span-2">
                <Label>Key Projects (Optional)</Label>
                <Textarea placeholder="Describe major projects and achievements..." rows={4} />
              </div>

              <div className="md:col-span-2">
                <Label>Documents (Offer/Relieving Letter, Payslips)</Label>
                <Input type="file" accept=".pdf" multiple />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={addExperience} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Another Experience
      </Button>
    </StepWrapper>
  );
};

export default WorkExperienceStep;
