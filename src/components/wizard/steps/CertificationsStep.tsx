import { useState } from "react";
import { Award, Plus, X } from "lucide-react";
import StepWrapper from "../StepWrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface CertificationsStepProps {
  onNext: () => void;
  onBack: () => void;
  updateFormData: (data: any) => void;
}

const CertificationsStep = ({ onNext, onBack, updateFormData }: CertificationsStepProps) => {
  const [certifications, setCertifications] = useState([
    { name: "", organization: "", domain: "", yearIssued: "", validTill: "", credentialId: "", file: null }
  ]);

  const addCertification = () => {
    setCertifications([...certifications, { name: "", organization: "", domain: "", yearIssued: "", validTill: "", credentialId: "", file: null }]);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    updateFormData({ certifications });
    onNext();
  };

  return (
    <StepWrapper title="Certifications" icon={<Award />} onNext={handleSubmit} onBack={onBack}>
      <div className="space-y-6">
        {certifications.map((cert, index) => (
          <div key={index} className="border border-border rounded-lg p-6 relative">
            {certifications.length > 1 && (
              <button
                onClick={() => removeCertification(index)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Certificate Name</Label>
                <Input placeholder="AWS Certified Solutions Architect" />
              </div>

              <div>
                <Label>Issuing Organization</Label>
                <Input placeholder="Amazon Web Services" />
              </div>

              <div>
                <Label>Domain/Category</Label>
                <Input placeholder="Cloud Computing" />
              </div>

              <div>
                <Label>Year of Issue</Label>
                <Input type="number" placeholder="2023" />
              </div>

              <div>
                <Label>Valid Till</Label>
                <Input type="number" placeholder="2026" />
              </div>

              <div>
                <Label>Certificate ID / Credential URL</Label>
                <Input placeholder="Certificate ID or verification URL" />
              </div>

              <div>
                <Label>Certificate File</Label>
                <Input type="file" accept=".pdf,.jpg,.jpeg" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={addCertification} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Another Certification
      </Button>
    </StepWrapper>
  );
};

export default CertificationsStep;
