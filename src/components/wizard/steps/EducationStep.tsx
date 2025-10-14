import { useState } from "react";
import { GraduationCap, Plus, X } from "lucide-react";
import StepWrapper from "../StepWrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface EducationStepProps {
  onNext: () => void;
  onBack: () => void;
  updateFormData: (data: any) => void;
}

const EducationStep = ({ onNext, onBack, updateFormData }: EducationStepProps) => {
  const [educations, setEducations] = useState([
    { level: "", institution: "", year: "", major: "", grade: "", certificate: null, transcript: null }
  ]);

  const addEducation = () => {
    setEducations([...educations, { level: "", institution: "", year: "", major: "", grade: "", certificate: null, transcript: null }]);
  };

  const removeEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    updateFormData({ education: educations });
    onNext();
  };

  return (
    <StepWrapper title="Education" icon={<GraduationCap />} onNext={handleSubmit} onBack={onBack}>
      {educations.map((edu, index) => (
        <div key={index} className="border border-border rounded-lg p-6 relative">
          {educations.length > 1 && (
            <Button
              onClick={() => removeEducation(index)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-5 h-5" />
            </Button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Education Level</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-school">High School</SelectItem>
                  <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                  <SelectItem value="masters">Master's Degree</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Institution Name</Label>
              <Input placeholder="University name" />
            </div>

            <div>
              <Label>Year of Completion</Label>
              <Input type="number" placeholder="2024" />
            </div>

            <div>
              <Label>Major/Field of Study</Label>
              <Input placeholder="Computer Science" />
            </div>

            <div>
              <Label>Grade/CGPA (Optional)</Label>
              <Input placeholder="3.8 / 4.0" />
            </div>

            <div>
              <Label>Certificate (PDF/JPG)</Label>
              <Input type="file" accept=".pdf,.jpg,.jpeg" />
            </div>

            <div className="md:col-span-2">
              <Label>Transcript (Optional)</Label>
              <Input type="file" accept=".pdf" />
            </div>
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={addEducation} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Another Education
      </Button>
    </StepWrapper>
  );
};

export default EducationStep;
