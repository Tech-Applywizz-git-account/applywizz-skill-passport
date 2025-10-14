import { useState } from "react";
import { Briefcase, Plus, X } from "lucide-react";
import StepWrapper from "../StepWrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface InternshipsStepProps {
  onNext: () => void;
  onBack: () => void;
  updateFormData: (data: any) => void;
}

const InternshipsStep = ({ onNext, onBack, updateFormData }: InternshipsStepProps) => {
  const [internships, setInternships] = useState([
    { company: "", role: "", from: "", to: "", domain: "", responsibilities: "", certificate: null }
  ]);

  const addInternship = () => {
    setInternships([...internships, { company: "", role: "", from: "", to: "", domain: "", responsibilities: "", certificate: null }]);
  };

  const removeInternship = (index: number) => {
    setInternships(internships.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    updateFormData({ internships });
    onNext();
  };

  return (
    <StepWrapper title="Internships" icon={<Briefcase />} onNext={handleSubmit} onBack={onBack}>
      <div className="space-y-6">
        {internships.map((internship, index) => (
          <div key={index} className="border border-border rounded-lg p-6 relative">
            {internships.length > 1 && (
              <button
                onClick={() => removeInternship(index)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Company Name</Label>
                <Input placeholder="Tech Corp Inc." />
              </div>

              <div>
                <Label>Role</Label>
                <Input placeholder="Software Engineering Intern" />
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
                <Label>Domain/Focus Area</Label>
                <Input placeholder="Web Development, Machine Learning, etc." />
              </div>

              <div className="md:col-span-2">
                <Label>Responsibilities</Label>
                <Textarea placeholder="Describe your key responsibilities and achievements..." rows={4} />
              </div>

              <div className="md:col-span-2">
                <Label>Internship Certificate</Label>
                <Input type="file" accept=".pdf,.jpg,.jpeg" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={addInternship} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Another Internship
      </Button>
    </StepWrapper>
  );
};

export default InternshipsStep;
