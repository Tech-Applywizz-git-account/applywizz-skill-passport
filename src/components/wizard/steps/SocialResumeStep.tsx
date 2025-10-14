import { FileText, Upload } from "lucide-react";
import StepWrapper from "../StepWrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SocialResumeStepProps {
  onNext: () => void;
  onBack: () => void;
  updateFormData: (data: any) => void;
}

const SocialResumeStep = ({ onNext, onBack, updateFormData }: SocialResumeStepProps) => {
  const handleSubmit = () => {
    updateFormData({ socialResume: {} });
    onNext();
  };

  return (
    <StepWrapper title="Social & Resume" icon={<FileText />} onNext={handleSubmit} onBack={onBack}>
      <div className="space-y-6">
        <div className="border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Social Profiles</h3>
          <div className="space-y-4">
            <div>
              <Label>LinkedIn URL</Label>
              <Input placeholder="https://linkedin.com/in/yourprofile" />
            </div>

            <div>
              <Label>Other Profiles (Twitter, Medium, etc.)</Label>
              <Input placeholder="https://twitter.com/username" />
            </div>
          </div>
        </div>

        <div className="border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Resume Upload</h3>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="font-medium mb-1">Drag & Drop your resume here</p>
            <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
            <Input type="file" accept=".pdf" className="hidden" id="resume-upload" />
            <label htmlFor="resume-upload" className="cursor-pointer">
              <span className="text-primary hover:underline">Choose PDF file</span>
            </label>
          </div>
        </div>
      </div>
    </StepWrapper>
  );
};

export default SocialResumeStep;
